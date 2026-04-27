import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Lịch sử" };

type ActivityType = "scored" | "rewritten";
type Activity = {
  type: ActivityType;
  itemId: string;
  itemTitle: string | null;
  versionNumber: number;
  score: number | null;
  scoreLabel: string | null;
  at: string;
};

function vnDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} ngày trước`;
  return vnDateTime(iso);
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user's items with their versions and scores in a few round-trips.
  const { data: items } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("user_id", user.id);
  const itemList = items ?? [];
  const itemMap = new Map(itemList.map((i) => [i.id, i.title]));
  const itemIds = itemList.map((i) => i.id);

  const events: Activity[] = [];

  if (itemIds.length) {
    const { data: versions } = await supabase
      .from("content_versions")
      .select("id, content_item_id, version_number, version_type, created_at")
      .in("content_item_id", itemIds)
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: scores } = await supabase
      .from("score_results")
      .select(
        "version_id, content_item_id, overall_score, score_label, created_at",
      )
      .in("content_item_id", itemIds);

    const scoreByVersion = new Map<
      string,
      { score: number; label: string; at: string }
    >();
    for (const s of scores ?? []) {
      scoreByVersion.set(s.version_id, {
        score: s.overall_score,
        label: s.score_label,
        at: s.created_at,
      });
    }

    for (const v of versions ?? []) {
      const score = scoreByVersion.get(v.id);
      events.push({
        type: v.version_type === "original" ? "scored" : "rewritten",
        itemId: v.content_item_id,
        itemTitle: itemMap.get(v.content_item_id) ?? null,
        versionNumber: v.version_number,
        score: score?.score ?? null,
        scoreLabel: score?.label ?? null,
        at: v.created_at,
      });
    }
  }

  events.sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <>
      <Topbar crumbs={[{ label: "Lịch sử" }]} />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Lịch sử hoạt động
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Mọi lần chấm điểm và viết lại của bạn được ghi lại theo thứ tự
              thời gian.
            </p>
          </div>

          {events.length === 0 ? (
            <EmptyState
              title="Chưa có hoạt động nào"
              description="Chấm điểm content đầu tiên để bắt đầu xây dựng lịch sử và lưu thư viện."
              ctaLabel="Chấm điểm content mới"
              ctaHref="/score/new/quick"
            />
          ) : (
            <ol className="relative space-y-4 border-l-2 border-[var(--color-border)] pl-6">
              {events.map((e, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[33px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full ${
                      e.type === "scored"
                        ? "bg-[var(--color-primary)]"
                        : "bg-[var(--color-success)]"
                    } text-white`}
                    aria-hidden
                  >
                    {e.type === "scored" ? (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M6 1l1.4 3.4L11 5l-3.6 0.6L6 9 4.6 5.6 1 5l3.6-0.6L6 1z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6.5L4.5 9 10 3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <Link
                    href={
                      e.type === "rewritten"
                        ? `/score/${e.itemId}/rewrite`
                        : `/score/${e.itemId}/result`
                    }
                    className="block rounded-[16px] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                  >
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          e.type === "scored"
                            ? "bg-[#e8f3ff] text-[var(--color-primary)]"
                            : "bg-[#dcfce7] text-[#15803d]"
                        }`}
                      >
                        {e.type === "scored"
                          ? `Đã chấm điểm · v${e.versionNumber}`
                          : `Đã viết lại · v${e.versionNumber}`}
                      </span>
                      <span className="text-[var(--color-text-muted)]">
                        {relativeTime(e.at)}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-[var(--color-text)]">
                      {e.itemTitle || "(không có tiêu đề)"}
                    </p>
                    {e.score !== null && (
                      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                        Điểm:{" "}
                        <span className="font-semibold text-[var(--color-text)]">
                          {e.score}/100
                        </span>{" "}
                        {e.scoreLabel && `· ${e.scoreLabel}`}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </>
  );
}
