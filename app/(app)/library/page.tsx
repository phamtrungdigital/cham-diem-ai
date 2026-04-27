import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Thư viện" };

const STATUS_LABEL: Record<string, { text: string; classes: string }> = {
  draft: {
    text: "Bản nháp",
    classes: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
  },
  scored: {
    text: "Đã chấm",
    classes: "bg-[#e8f3ff] text-[var(--color-primary)]",
  },
  optimized: {
    text: "Đã tối ưu",
    classes: "bg-[#dcfce7] text-[#15803d]",
  },
  archived: {
    text: "Lưu trữ",
    classes: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
  },
};

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

export default async function LibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("content_items")
    .select(
      "id, title, status, objective, industry, updated_at, content_versions(id, version_number)",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(60);

  const itemList = items ?? [];
  const itemIds = itemList.map((i) => i.id);

  type ScoreRow = {
    content_item_id: string;
    overall_score: number;
    score_label: string;
    ctr_potential_range: string | null;
    created_at: string;
  };

  // Latest score per content_item
  let latestByItem = new Map<string, ScoreRow>();
  if (itemIds.length) {
    const { data: scores } = await supabase
      .from("score_results")
      .select(
        "content_item_id, overall_score, score_label, ctr_potential_range, created_at",
      )
      .in("content_item_id", itemIds)
      .order("created_at", { ascending: false });
    for (const s of (scores as ScoreRow[] | null) ?? []) {
      if (!latestByItem.has(s.content_item_id)) {
        latestByItem.set(s.content_item_id, s);
      }
    }
  }

  const totalCount = itemList.length;

  return (
    <>
      <Topbar
        crumbs={[{ label: "Thư viện" }]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[var(--color-text)]">
                Thư viện content
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {totalCount === 0
                  ? "Chưa có content nào — bắt đầu bằng việc chấm điểm content đầu tiên."
                  : `${totalCount} content đã chấm. Click vào card để xem kết quả.`}
              </p>
            </div>
            <Link
              href="/score/new/quick"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] hover:bg-[var(--color-primary-hover)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M7 1v12M1 7h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              Chấm content mới
            </Link>
          </div>

          {totalCount === 0 ? (
            <EmptyState
              title="Thư viện đang trống"
              description="Mỗi content bạn chấm điểm sẽ được lưu ở đây để bạn xem lại, so sánh phiên bản và copy nhanh khi cần."
              ctaLabel="Chấm content đầu tiên"
              ctaHref="/score/new/quick"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {itemList.map((item) => {
                const score = latestByItem.get(item.id);
                const versionCount = Array.isArray(item.content_versions)
                  ? item.content_versions.length
                  : 0;
                const status = STATUS_LABEL[item.status] ?? STATUS_LABEL.draft;
                return (
                  <Link
                    key={item.id}
                    href={`/score/${item.id}/result`}
                    className="group flex flex-col rounded-[20px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${status.classes}`}
                      >
                        {status.text}
                      </span>
                      {versionCount > 1 && (
                        <span className="inline-flex h-6 items-center rounded-full bg-[var(--color-bg)] px-2.5 text-xs font-medium text-[var(--color-text-muted)]">
                          {versionCount} phiên bản
                        </span>
                      )}
                    </div>

                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                      {item.title || "Không có tiêu đề"}
                    </p>

                    {score ? (
                      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                        <div>
                          <p
                            className="text-2xl font-semibold tracking-tight"
                            style={{ color: scoreColor(score.overall_score) }}
                          >
                            {score.overall_score}
                            <span className="text-sm font-medium text-[var(--color-text-muted)]">
                              /100
                            </span>
                          </p>
                          <p
                            className="text-xs font-medium"
                            style={{ color: scoreColor(score.overall_score) }}
                          >
                            {score.score_label}
                          </p>
                        </div>
                        <div className="text-right">
                          {score.ctr_potential_range && (
                            <>
                              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                                CTR Potential
                              </p>
                              <p className="text-xs font-semibold text-[var(--color-primary)]">
                                {score.ctr_potential_range}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-auto text-xs text-[var(--color-text-muted)]">
                        Chưa có điểm
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
                      {item.objective && (
                        <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5">
                          {item.objective}
                        </span>
                      )}
                      <span className="ml-auto">{vnDate(item.updated_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
