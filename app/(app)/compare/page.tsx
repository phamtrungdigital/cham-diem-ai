import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "So sánh" };

function scoreColor(score: number) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

function vnDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("content_items")
    .select(
      "id, title, status, updated_at, content_versions(id, version_number)",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const itemList = items ?? [];
  const multiVersion = itemList.filter(
    (i) => Array.isArray(i.content_versions) && i.content_versions.length >= 2,
  );

  const itemIds = multiVersion.map((i) => i.id);
  type ScoreRow = {
    content_item_id: string;
    version_id: string;
    overall_score: number;
    score_label: string;
    created_at: string;
  };
  const scoresByItem = new Map<string, ScoreRow[]>();
  if (itemIds.length) {
    const { data } = await supabase
      .from("score_results")
      .select(
        "content_item_id, version_id, overall_score, score_label, created_at",
      )
      .in("content_item_id", itemIds)
      .order("created_at", { ascending: true });
    for (const s of (data as ScoreRow[] | null) ?? []) {
      const arr = scoresByItem.get(s.content_item_id) ?? [];
      arr.push(s);
      scoresByItem.set(s.content_item_id, arr);
    }
  }

  return (
    <>
      <Topbar crumbs={[{ label: "So sánh" }]} />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              So sánh trước / sau
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Danh sách content đã có nhiều phiên bản — click để xem so sánh
              điểm số và cải thiện theo từng tiêu chí.
            </p>
          </div>

          {multiVersion.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                title="Chưa có content nào để so sánh"
                description="Sau khi chấm điểm content, bạn có thể bấm 'Tối ưu content với AI' để tạo phiên bản mới và so sánh với bản gốc."
                ctaLabel="Mở thư viện"
                ctaHref="/library"
              />
              <p className="text-center text-xs text-[var(--color-text-muted)]">
                Hoặc{" "}
                <Link
                  href="/score/new/quick"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  chấm điểm content mới
                </Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {multiVersion.map((item) => {
                const scores = scoresByItem.get(item.id) ?? [];
                const first = scores[0];
                const last = scores[scores.length - 1];
                const delta =
                  first && last ? last.overall_score - first.overall_score : 0;
                const deltaSign = delta > 0 ? "+" : delta < 0 ? "−" : "";
                const deltaColor =
                  delta > 0
                    ? "var(--color-success)"
                    : delta < 0
                      ? "var(--color-error)"
                      : "var(--color-text-muted)";
                return (
                  <li key={item.id}>
                    <Link
                      href={`/score/${item.id}/rewrite`}
                      className="grid items-center gap-4 rounded-[16px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 md:grid-cols-[1fr_auto_auto_auto]"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium text-[var(--color-text)]">
                          {item.title || "(không có tiêu đề)"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {Array.isArray(item.content_versions)
                            ? item.content_versions.length
                            : 0}{" "}
                          phiên bản · cập nhật {vnDate(item.updated_at)}
                        </p>
                      </div>

                      {first && last && (
                        <div className="flex items-center gap-3 text-sm">
                          <span
                            className="font-semibold"
                            style={{ color: scoreColor(first.overall_score) }}
                          >
                            {first.overall_score}
                          </span>
                          <span className="text-[var(--color-text-muted)]">
                            →
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: scoreColor(last.overall_score) }}
                          >
                            {last.overall_score}
                          </span>
                        </div>
                      )}

                      <span
                        className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold"
                        style={{ color: deltaColor }}
                      >
                        {delta === 0 ? "—" : `${deltaSign}${Math.abs(delta)}`}
                      </span>

                      <span className="text-xs font-medium text-[var(--color-primary)]">
                        Xem so sánh →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
