import ScoreGauge from "@/components/ScoreGauge";

const strengths = [
  "Hook thu hút, rõ lợi ích",
  "Lời kêu gọi hành động tốt",
  "CTA mạnh, thúc đẩy hành động",
];

const weaknesses = [
  "Thiếu số liệu cụ thể",
  "Thiếu bằng chứng xã hội",
  "Tiêu đề dài, khó scan",
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="var(--color-success)" />
      <path
        d="M4 7l2 2 4-4"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="7" fill="var(--color-error)" />
      <path
        d="M7 4v3.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.6" r="0.7" fill="white" />
    </svg>
  );
}

export default function ScoreShowcase() {
  return (
    <section className="px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[var(--color-text)] md:text-3xl">
          Kết quả chấm điểm
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
            <p className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              Điểm tổng quan
            </p>
            <div className="flex items-center gap-5">
              <ScoreGauge score={82} label="Rất tốt" size="md" />
              <div className="flex flex-1 flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">CTR dự đoán</p>
                  <p className="font-semibold text-[var(--color-primary)]">
                    1.4% – 3.6x
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">CPM dự đoán</p>
                  <p className="font-semibold text-[var(--color-primary)]">
                    280.000đ
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    /1000 lượt tiếp cận
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[20px] border border-[#dcfce7] bg-[#f0fdf4] p-6 shadow-[var(--shadow-card)]">
            <p className="mb-4 text-sm font-semibold text-[#15803d]">
              Điểm mạnh
            </p>
            <ul className="space-y-3">
              {strengths.map((s) => (
                <li
                  key={s}
                  className="flex items-start gap-2.5 text-sm text-[var(--color-text)]"
                >
                  <span className="mt-0.5 flex-shrink-0">
                    <CheckIcon />
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[20px] border border-[#fee2e2] bg-[#fef2f2] p-6 shadow-[var(--shadow-card)]">
            <p className="mb-4 text-sm font-semibold text-[#b91c1c]">
              Cần cải thiện
            </p>
            <ul className="space-y-3">
              {weaknesses.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2.5 text-sm text-[var(--color-text)]"
                >
                  <span className="mt-0.5 flex-shrink-0">
                    <WarnIcon />
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
