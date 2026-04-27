import ScoreGauge from "@/components/ScoreGauge";
import CopyButton from "@/components/score/CopyButton";

export type VersionSummary = {
  versionNumber: number;
  versionType: string;
  body: string;
  score: number;
  scoreLabel: string;
  ctrLevel: string | null;
  ctrRange: string | null;
  criteria: Array<{ key: string; name: string; score: number }>;
};

type CompareViewProps = {
  before: VersionSummary;
  after: VersionSummary;
};

const versionTypeLabel = (t: string) =>
  t === "original"
    ? "Bản gốc"
    : t === "ai_optimized"
    ? "Bản AI tối ưu"
    : "Bản chỉnh sửa";

function delta(a: number, b: number) {
  const d = b - a;
  if (d > 0) return { sign: "+", value: d, color: "var(--color-success)" };
  if (d < 0) return { sign: "−", value: -d, color: "var(--color-error)" };
  return { sign: "", value: 0, color: "var(--color-text-muted)" };
}

export default function CompareView({ before, after }: CompareViewProps) {
  const overall = delta(before.score, after.score);

  return (
    <div className="space-y-5">
      {/* Headline metric */}
      <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="grid items-center gap-6 md:grid-cols-3">
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Trước
            </p>
            <ScoreGauge
              score={before.score}
              label={before.scoreLabel}
              size="md"
            />
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Cải thiện
            </p>
            <p
              className="text-5xl font-semibold tracking-tight"
              style={{ color: overall.color }}
            >
              {overall.sign}
              {overall.value}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">điểm</p>
          </div>
          <div className="text-center">
            <p className="mb-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              Sau
            </p>
            <ScoreGauge
              score={after.score}
              label={after.scoreLabel}
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Side by side content */}
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[20px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)]">
                v{before.versionNumber}
              </span>
              {versionTypeLabel(before.versionType)}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {before.score}/100 · {before.ctrRange ?? before.ctrLevel}
            </span>
          </div>
          <pre className="whitespace-pre-wrap rounded-[12px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 font-sans text-sm leading-relaxed text-[var(--color-text)]">
            {before.body}
          </pre>
        </article>

        <article className="rounded-[20px] border-2 border-[var(--color-primary)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white">
                v{after.versionNumber}
              </span>
              {versionTypeLabel(after.versionType)}
            </span>
            <span className="text-xs font-semibold text-[var(--color-primary)]">
              {after.score}/100 · {after.ctrRange ?? after.ctrLevel}
            </span>
          </div>
          <pre className="whitespace-pre-wrap rounded-[12px] border border-[var(--color-border)] bg-white p-4 font-sans text-sm leading-relaxed text-[var(--color-text)]">
            {after.body}
          </pre>
          <div className="mt-3 flex justify-end">
            <CopyButton text={after.body} />
          </div>
        </article>
      </section>

      {/* Criteria diff */}
      <section className="rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)]">
        <h2 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
          Cải thiện theo từng tiêu chí
        </h2>
        <div className="space-y-2">
          {after.criteria.map((c) => {
            const beforeC = before.criteria.find((b) => b.key === c.key);
            const beforeScore = beforeC?.score ?? 0;
            const d = delta(beforeScore, c.score);
            return (
              <div
                key={c.key}
                className="grid items-center gap-3 rounded-[12px] border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm md:grid-cols-[1fr_auto_auto_auto_auto]"
              >
                <span className="font-medium text-[var(--color-text)]">
                  {c.name}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {beforeScore}
                </span>
                <span className="text-[var(--color-text-muted)]">→</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {c.score}
                </span>
                <span
                  className="text-right text-xs font-semibold"
                  style={{ color: d.color }}
                >
                  {d.value === 0 ? "—" : `${d.sign}${d.value}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
