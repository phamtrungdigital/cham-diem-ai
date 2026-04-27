import ScoreGauge from "@/components/ScoreGauge";

const criteriaScores = [
  { name: "Hook", score: 90 },
  { name: "Lợi ích", score: 85 },
  { name: "CTA", score: 80 },
  { name: "Độ rõ ràng", score: 75 },
];

const trendPoints = [
  { x: "12/05", y: 50 },
  { x: "13/05", y: 60 },
  { x: "14/05", y: 55 },
  { x: "15/05", y: 75 },
  { x: "16/05", y: 82 },
];

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f3ff] text-xs font-semibold text-[var(--color-primary)]">
        {n}
      </span>
      <span className="text-sm font-semibold text-[var(--color-text)]">
        {label}
      </span>
    </div>
  );
}

function TrendChart() {
  const w = 220;
  const h = 80;
  const max = 100;
  const stepX = w / (trendPoints.length - 1);
  const points = trendPoints
    .map((p, i) => `${i * stepX},${h - (p.y / max) * h}`)
    .join(" ");

  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-white p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {trendPoints.map((p, i) => (
          <circle
            key={p.x}
            cx={i * stepX}
            cy={h - (p.y / max) * h}
            r="3"
            fill="var(--color-primary)"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-[var(--color-text-muted)]">
        {trendPoints.map((p) => (
          <span key={p.x}>{p.x}</span>
        ))}
      </div>
    </div>
  );
}

export default function ProductExperience() {
  return (
    <section className="px-6 py-16 md:py-20" id="features">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
          Trải nghiệm sản phẩm
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <StepBadge n={1} label="Chấm điểm nội dung" />
            <div className="space-y-2 rounded-[12px] border border-[var(--color-border)] bg-[#fafbfc] p-4">
              <span className="block h-2.5 w-3/4 rounded bg-[var(--color-border)]" />
              <span className="block h-2.5 w-full rounded bg-[var(--color-border)]" />
              <span className="block h-2.5 w-5/6 rounded bg-[var(--color-border)]" />
            </div>
            <button className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary)] text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M7 1l1.5 4.5L13 7l-4.5 1.5L7 13l-1.5-4.5L1 7l4.5-1.5L7 1z"
                  fill="currentColor"
                />
              </svg>
              Chấm điểm
            </button>
          </article>

          <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <StepBadge n={2} label="Phân tích chi tiết" />
            <div className="flex items-center gap-4">
              <ScoreGauge score={82} label="Rất tốt" size="sm" />
              <div className="flex-1 space-y-2.5 text-xs">
                {criteriaScores.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[var(--color-text)]">{c.name}</span>
                      <span className="font-semibold text-[var(--color-text)]">
                        {c.score}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
                      <span
                        className="block h-full rounded-full bg-[var(--color-success)]"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <StepBadge n={3} label="Lịch sử & so sánh" />
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <TrendChart />
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-3 py-2 text-center">
                  <p className="text-base font-semibold text-[#15803d]">82</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Điểm mới</p>
                </div>
                <div className="rounded-lg border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-center">
                  <p className="text-base font-semibold text-[#b91c1c]">48</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Điểm cũ</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
