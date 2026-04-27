import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import ScoreGauge from "@/components/ScoreGauge";
import CriteriaBar from "@/components/score/CriteriaBar";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export const metadata = { title: "Kết quả chấm điểm" };

type CriteriaRow = {
  criteria_key: string;
  criteria_name: string;
  score: number;
  weight: number;
  explanation: string | null;
};

type PolicyRisk = { level: string; issue: string; suggestion: string };

export default async function ResultPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: item } = await supabase
    .from("content_items")
    .select("id, title, objective, audience, industry, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!item) notFound();

  const { data: version } = await supabase
    .from("content_versions")
    .select("id, body, version_number")
    .eq("content_item_id", id)
    .order("version_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: result } = await supabase
    .from("score_results")
    .select(
      "id, overall_score, score_label, ctr_potential_level, ctr_potential_range, ctr_potential_note, summary, strengths, weaknesses, recommendations, policy_risks",
    )
    .eq("content_item_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!result) notFound();

  const { data: criteria } = await supabase
    .from("criteria_scores")
    .select("criteria_key, criteria_name, score, weight, explanation")
    .eq("score_result_id", result.id);

  const criteriaSorted: CriteriaRow[] = (criteria ?? []).sort(
    (a, b) => b.weight - a.weight,
  );

  const strengths = (result.strengths as string[] | null) ?? [];
  const weaknesses = (result.weaknesses as string[] | null) ?? [];
  const recommendations =
    (result.recommendations as string[] | null) ?? [];
  const policyRisks = (result.policy_risks as PolicyRisk[] | null) ?? [];

  return (
    <>
      <Topbar
        crumbs={[
          { label: "Chấm điểm", href: "/score/new" },
          { label: "Kết quả" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top: gauge + CTR + summary */}
          <section className="grid gap-6 rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center justify-center md:items-start">
              <ScoreGauge
                score={result.overall_score}
                label={result.score_label}
                size="lg"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  CTR Potential
                </p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">
                  {result.ctr_potential_range}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {result.ctr_potential_level}
                </p>
              </div>
              {result.summary && (
                <p className="text-sm leading-relaxed text-[var(--color-text)]">
                  {result.summary}
                </p>
              )}
              <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
                ⓘ {result.ctr_potential_note}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href={`/score/${id}/rewrite`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary)] px-4 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] hover:bg-[var(--color-primary-hover)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M7 1l1.6 4 4.4.4-3.4 3 1 4.3L7 10.6 3.4 12.7l1-4.3L1 5.4 5.4 5 7 1z"
                      fill="currentColor"
                    />
                  </svg>
                  Tối ưu content với AI
                </Link>
                <Link
                  href="/score/new/quick"
                  className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]"
                >
                  Chấm content khác
                </Link>
                <Link
                  href="/library"
                  className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]"
                >
                  Mở thư viện
                </Link>
              </div>
            </div>
          </section>

          {/* Strengths + Weaknesses */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#dcfce7] bg-[#f0fdf4] p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#15803d]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#15803d] text-white">
                  ✓
                </span>
                Điểm mạnh
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-text)]">
                {strengths.length === 0 ? (
                  <li className="text-[var(--color-text-muted)]">
                    Chưa có điểm mạnh nổi bật
                  </li>
                ) : (
                  strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#15803d]" />
                      {s}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-[20px] border border-[#fee2e2] bg-[#fef2f2] p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#b91c1c]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#b91c1c] text-white">
                  !
                </span>
                Cần cải thiện
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-text)]">
                {weaknesses.length === 0 ? (
                  <li className="text-[var(--color-text-muted)]">
                    Không có điểm yếu lớn
                  </li>
                ) : (
                  weaknesses.map((w) => (
                    <li key={w} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#b91c1c]" />
                      {w}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>

          {/* Criteria scores */}
          <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              Điểm theo 9 tiêu chí
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {criteriaSorted.map((c) => (
                <CriteriaBar
                  key={c.criteria_key}
                  name={c.criteria_name}
                  score={c.score}
                  weight={c.weight}
                  explanation={c.explanation}
                />
              ))}
            </div>
          </section>

          {/* Policy risks (if any) */}
          {policyRisks.length > 0 && (
            <section className="rounded-[20px] border border-[#fde68a] bg-[#fffbeb] p-6">
              <h2 className="mb-3 text-sm font-semibold text-[#92400e]">
                Rủi ro chính sách
              </h2>
              <ul className="space-y-3">
                {policyRisks.map((r, i) => (
                  <li key={i} className="text-sm text-[var(--color-text)]">
                    <p className="font-medium">
                      <span className="mr-2 inline-flex items-center rounded-full bg-[#fef3c7] px-2 py-0.5 text-xs uppercase tracking-wide text-[#92400e]">
                        {r.level}
                      </span>
                      {r.issue}
                    </p>
                    <p className="mt-1 text-[var(--color-text-muted)]">
                      → {r.suggestion}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                Đề xuất tối ưu
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-text)]">
                {recommendations.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Original content */}
          {version && (
            <details className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text)]">
                Xem lại content gốc
              </summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-sans text-sm leading-relaxed text-[var(--color-text)]">
                {version.body}
              </pre>
            </details>
          )}
        </div>
      </main>
    </>
  );
}
