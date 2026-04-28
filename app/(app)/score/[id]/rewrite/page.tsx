import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import RewriteOptions from "@/components/score/RewriteOptions";
import CompareView, {
  type VersionSummary,
} from "@/components/score/CompareView";
import { createClient } from "@/lib/supabase/server";
import { listPresets } from "@/lib/presets/actions";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Tối ưu content" };

export default async function RewritePage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!item) notFound();

  // Fetch all versions + their score_results in one go.
  const { data: versions } = await supabase
    .from("content_versions")
    .select("id, version_number, version_type, body")
    .eq("content_item_id", id)
    .order("version_number", { ascending: true });

  const versionList = versions ?? [];

  // For each version, fetch latest score (one row per version expected).
  const summaries: VersionSummary[] = [];
  for (const v of versionList) {
    const { data: score } = await supabase
      .from("score_results")
      .select(
        "id, overall_score, score_label, ctr_potential_level, ctr_potential_range",
      )
      .eq("version_id", v.id)
      .maybeSingle();
    if (!score) continue;
    const { data: criteria } = await supabase
      .from("criteria_scores")
      .select("criteria_key, criteria_name, score")
      .eq("score_result_id", score.id);
    summaries.push({
      versionNumber: v.version_number,
      versionType: v.version_type,
      body: v.body,
      score: score.overall_score,
      scoreLabel: score.score_label,
      ctrLevel: score.ctr_potential_level,
      ctrRange: score.ctr_potential_range,
      criteria: (criteria ?? []).map((c) => ({
        key: c.criteria_key,
        name: c.criteria_name,
        score: c.score,
      })),
    });
  }

  const hasRewrite = summaries.length >= 2;
  const before = summaries[0];
  const after = hasRewrite ? summaries[summaries.length - 1] : null;

  const presets = await listPresets("rewrite");

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Chấm điểm", href: "/score/new" },
          { label: "Kết quả", href: `/score/${id}/result` },
          { label: "Tối ưu" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              {hasRewrite ? "So sánh trước / sau" : "Tối ưu content với AI"}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {hasRewrite
                ? "Bản viết lại đã được chấm điểm. Bạn có thể tạo bản khác hoặc copy bản tốt hơn."
                : "Chọn giọng văn, độ dài và mục tiêu — AI sẽ viết lại content và chấm điểm bản mới."}
            </p>
          </div>

          {hasRewrite && before && after && (
            <CompareView before={before} after={after} />
          )}

          <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              {hasRewrite ? "Tạo bản viết lại khác" : "Tuỳ chọn viết lại"}
            </h2>
            <RewriteOptions contentItemId={id} presets={presets} />
          </section>

          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href={`/score/${id}/result`}
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]"
            >
              ← Quay lại kết quả
            </Link>
            <Link
              href="/library"
              className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]"
            >
              Mở thư viện
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
