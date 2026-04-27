import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard" };

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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const name = (user.user_metadata?.name as string | undefined)?.split(" ")[0];

  const { data: items } = await supabase
    .from("content_items")
    .select("id, title, status, objective, updated_at, created_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(50);

  const itemList = items ?? [];
  const itemIds = itemList.map((i) => i.id);

  type ScoreRow = {
    content_item_id: string;
    overall_score: number;
    score_label: string;
    ctr_potential_range: string | null;
    created_at: string;
  };

  // Latest score per item
  const latestByItem = new Map<string, ScoreRow>();
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

  const scoredItems = itemList.filter((i) => latestByItem.has(i.id));
  const totalCount = scoredItems.length;
  const avgScore =
    totalCount > 0
      ? Math.round(
          scoredItems.reduce(
            (sum, i) => sum + (latestByItem.get(i.id)?.overall_score ?? 0),
            0,
          ) / totalCount,
        )
      : null;
  const goodCount = scoredItems.filter(
    (i) => (latestByItem.get(i.id)?.overall_score ?? 0) >= 80,
  ).length;
  const needWorkCount = scoredItems.filter((i) => {
    const s = latestByItem.get(i.id)?.overall_score ?? 0;
    return s > 0 && s < 60;
  }).length;

  const recentItems = scoredItems.slice(0, 8);

  const kpis = [
    {
      label: "Tổng lượt chấm",
      value: String(totalCount),
      hint: totalCount === 0 ? "Bắt đầu với content đầu tiên" : "Đã lưu thư viện",
    },
    {
      label: "Điểm trung bình",
      value: avgScore !== null ? String(avgScore) : "—",
      hint: avgScore !== null ? `${totalCount} content` : "Cần ít nhất 1 lượt chấm",
    },
    {
      label: "Nội dung tốt",
      value: String(goodCount),
      hint: "Điểm từ 80 trở lên",
    },
    {
      label: "Cần tối ưu",
      value: String(needWorkCount),
      hint: "Điểm dưới 60",
    },
  ];

  return (
    <>
      <Topbar crumbs={[{ label: "Dashboard" }]} />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Chào {name ?? "bạn"} 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Tổng quan chất lượng content và truy cập nhanh vào flow chấm điểm.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              Phân tích gần đây
            </h2>
            {recentItems.length > 0 && (
              <Link
                href="/library"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Xem toàn bộ thư viện →
              </Link>
            )}
          </div>
          {recentItems.length === 0 ? (
            <EmptyState
              title="Bạn chưa chấm điểm content nào"
              description="Dán content Facebook Ads đầu tiên để AI phân tích, gợi ý tối ưu và tăng CTR."
              ctaLabel="Chấm điểm content mới"
              ctaHref="/score/new"
            />
          ) : (
            <div className="overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-bg)] text-left text-xs text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Nội dung</th>
                    <th className="px-3 py-3 font-medium">Mục tiêu</th>
                    <th className="px-3 py-3 font-medium">Điểm</th>
                    <th className="px-3 py-3 font-medium">CTR Potential</th>
                    <th className="px-3 py-3 font-medium">Ngày</th>
                    <th className="px-5 py-3 text-right font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {recentItems.map((item) => {
                    const s = latestByItem.get(item.id)!;
                    return (
                      <tr key={item.id} className="hover:bg-[var(--color-bg)]">
                        <td className="max-w-[280px] truncate px-5 py-3 text-[var(--color-text)]">
                          {item.title || "(không có tiêu đề)"}
                        </td>
                        <td className="px-3 py-3 text-[var(--color-text-muted)]">
                          {item.objective ?? "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className="font-semibold"
                            style={{ color: scoreColor(s.overall_score) }}
                          >
                            {s.overall_score}
                          </span>
                          <span className="ml-1 text-xs text-[var(--color-text-muted)]">
                            {s.score_label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[var(--color-primary)]">
                          {s.ctr_potential_range ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-[var(--color-text-muted)]">
                          {vnDate(item.updated_at)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            href={`/score/${item.id}/result`}
                            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                          >
                            Xem
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
