import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/app/Topbar";
import KpiCard from "@/components/app/KpiCard";
import EmptyState from "@/components/app/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { CRITERIA_DEFS } from "@/lib/ai/schemas";

export const metadata = { title: "Báo cáo" };

function scoreColor(score: number) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("content_items")
    .select("id, title")
    .eq("user_id", user.id);
  const itemMap = new Map((items ?? []).map((i) => [i.id, i.title]));
  const itemIds = Array.from(itemMap.keys());

  if (itemIds.length === 0) {
    return (
      <>
        <Topbar crumbs={[{ label: "Báo cáo" }]} />
        <main className="flex-1 px-6 py-8 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-[var(--color-text)]">
                Báo cáo
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Tổng kết chất lượng content và các tiêu chí cần cải thiện.
              </p>
            </div>
            <EmptyState
              title="Chưa có dữ liệu báo cáo"
              description="Cần ít nhất 1 content đã chấm điểm để hiện báo cáo."
              ctaLabel="Chấm điểm content mới"
              ctaHref="/score/new/quick"
            />
          </div>
        </main>
      </>
    );
  }

  // Latest score per item (ordered DESC by created_at, take first per item).
  type ScoreRow = {
    id: string;
    content_item_id: string;
    overall_score: number;
    score_label: string;
    ctr_potential_range: string | null;
    ctr_potential_level: string | null;
    created_at: string;
  };
  const { data: scores } = await supabase
    .from("score_results")
    .select(
      "id, content_item_id, overall_score, score_label, ctr_potential_range, ctr_potential_level, created_at",
    )
    .in("content_item_id", itemIds)
    .order("created_at", { ascending: false });

  const latestByItem = new Map<string, ScoreRow>();
  for (const s of (scores as ScoreRow[] | null) ?? []) {
    if (!latestByItem.has(s.content_item_id)) {
      latestByItem.set(s.content_item_id, s);
    }
  }

  const latestScores = Array.from(latestByItem.values());
  const totalScored = latestScores.length;

  if (totalScored === 0) {
    return (
      <>
        <Topbar crumbs={[{ label: "Báo cáo" }]} />
        <main className="flex-1 px-6 py-8 md:px-8">
          <div className="mx-auto max-w-4xl">
            <EmptyState
              title="Chưa có content nào được chấm"
              description="Cần ít nhất 1 content đã chấm điểm để hiện báo cáo."
              ctaLabel="Chấm điểm content mới"
              ctaHref="/score/new/quick"
            />
          </div>
        </main>
      </>
    );
  }

  const avgScore = Math.round(
    latestScores.reduce((s, r) => s + r.overall_score, 0) / totalScored,
  );
  const goodCount = latestScores.filter((s) => s.overall_score >= 80).length;
  const needWorkCount = latestScores.filter((s) => s.overall_score < 60).length;
  const goodRate = Math.round((goodCount / totalScored) * 100);
  const needWorkRate = Math.round((needWorkCount / totalScored) * 100);

  // Average per criteria across LATEST scores.
  const latestScoreIds = latestScores.map((s) => s.id);
  const { data: criteria } = await supabase
    .from("criteria_scores")
    .select("criteria_key, criteria_name, score, weight")
    .in("score_result_id", latestScoreIds);

  const criteriaAvg = new Map<
    string,
    { name: string; sum: number; n: number; weight: number }
  >();
  for (const c of criteria ?? []) {
    const cur = criteriaAvg.get(c.criteria_key) ?? {
      name: c.criteria_name,
      sum: 0,
      n: 0,
      weight: c.weight,
    };
    cur.sum += c.score;
    cur.n += 1;
    criteriaAvg.set(c.criteria_key, cur);
  }
  const criteriaList = CRITERIA_DEFS.map((def) => {
    const cur = criteriaAvg.get(def.key);
    return {
      key: def.key,
      name: def.name,
      weight: def.weight,
      avg: cur ? Math.round(cur.sum / cur.n) : null,
    };
  }).filter((c) => c.avg !== null) as Array<{
    key: string;
    name: string;
    weight: number;
    avg: number;
  }>;
  criteriaList.sort((a, b) => a.avg - b.avg);
  const weakest = criteriaList.slice(0, 3);
  const strongest = [...criteriaList].sort((a, b) => b.avg - a.avg).slice(0, 3);

  // Top / bottom content
  const sortedScores = [...latestScores].sort(
    (a, b) => b.overall_score - a.overall_score,
  );
  const topContent = sortedScores.slice(0, 3);
  const bottomContent = sortedScores.slice(-3).reverse();

  return (
    <>
      <Topbar crumbs={[{ label: "Báo cáo" }]} />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Báo cáo chất lượng content
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Tổng hợp từ {totalScored} content đã chấm điểm.
            </p>
          </div>

          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Tổng content đã chấm"
              value={String(totalScored)}
              hint="Tính trên phiên bản mới nhất mỗi content"
            />
            <KpiCard
              label="Điểm trung bình"
              value={String(avgScore)}
              hint="Trung bình cộng tất cả content"
            />
            <KpiCard
              label="Tỷ lệ content tốt"
              value={`${goodRate}%`}
              hint={`${goodCount}/${totalScored} đạt ≥ 80 điểm`}
            />
            <KpiCard
              label="Cần tối ưu"
              value={`${needWorkRate}%`}
              hint={`${needWorkCount}/${totalScored} dưới 60 điểm`}
            />
          </div>

          {/* Weakest + Strongest criteria */}
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[20px] border border-[#fee2e2] bg-[#fef2f2] p-6">
              <h2 className="mb-4 text-sm font-semibold text-[#b91c1c]">
                3 tiêu chí yếu thường gặp
              </h2>
              {weakest.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Chưa đủ dữ liệu
                </p>
              ) : (
                <ul className="space-y-3">
                  {weakest.map((c, i) => (
                    <li key={c.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-[var(--color-text)]">
                          {i + 1}. {c.name}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: scoreColor(c.avg) }}
                        >
                          {c.avg}/100
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${c.avg}%`,
                            backgroundColor: scoreColor(c.avg),
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-[20px] border border-[#dcfce7] bg-[#f0fdf4] p-6">
              <h2 className="mb-4 text-sm font-semibold text-[#15803d]">
                3 tiêu chí mạnh nhất
              </h2>
              {strongest.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Chưa đủ dữ liệu
                </p>
              ) : (
                <ul className="space-y-3">
                  {strongest.map((c, i) => (
                    <li key={c.key}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-[var(--color-text)]">
                          {i + 1}. {c.name}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: scoreColor(c.avg) }}
                        >
                          {c.avg}/100
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${c.avg}%`,
                            backgroundColor: scoreColor(c.avg),
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>

          {/* Top + bottom content */}
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
                Top content điểm cao
              </h2>
              <ul className="space-y-3">
                {topContent.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/score/${s.content_item_id}/result`}
                      className="flex items-center gap-3 rounded-[12px] border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-primary)]/40"
                    >
                      <span
                        className="text-2xl font-semibold tabular-nums"
                        style={{ color: scoreColor(s.overall_score) }}
                      >
                        {s.overall_score}
                      </span>
                      <span className="line-clamp-2 flex-1 text-sm text-[var(--color-text)]">
                        {itemMap.get(s.content_item_id) ?? "(không có tiêu đề)"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
                Content cần tối ưu
              </h2>
              <ul className="space-y-3">
                {bottomContent.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/score/${s.content_item_id}/rewrite`}
                      className="flex items-center gap-3 rounded-[12px] border border-[var(--color-border)] p-3 transition-colors hover:border-[var(--color-primary)]/40"
                    >
                      <span
                        className="text-2xl font-semibold tabular-nums"
                        style={{ color: scoreColor(s.overall_score) }}
                      >
                        {s.overall_score}
                      </span>
                      <span className="line-clamp-2 flex-1 text-sm text-[var(--color-text)]">
                        {itemMap.get(s.content_item_id) ?? "(không có tiêu đề)"}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-primary)]">
                        Tối ưu →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* All criteria heat */}
          <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              Bảng điểm trung bình theo 9 tiêu chí
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {CRITERIA_DEFS.map((def) => {
                const cur = criteriaList.find((c) => c.key === def.key);
                const avg = cur?.avg ?? null;
                return (
                  <div
                    key={def.key}
                    className="flex items-center gap-3 rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
                  >
                    <span className="flex-1 text-[var(--color-text)]">
                      {def.name}
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
                        trọng số {def.weight}
                      </span>
                    </span>
                    {avg !== null ? (
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: scoreColor(avg) }}
                      >
                        {avg}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
