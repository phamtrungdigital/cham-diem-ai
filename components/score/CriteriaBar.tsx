type CriteriaBarProps = {
  name: string;
  score: number;
  weight: number;
  explanation?: string | null;
};

function color(score: number) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

export default function CriteriaBar({
  name,
  score,
  weight,
  explanation,
}: CriteriaBarProps) {
  const c = color(score);
  return (
    <div className="rounded-[12px] border border-[var(--color-border)] bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {name}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">
            trọng số {weight}
          </span>
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: c }}
        >
          {score}/100
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${score}%`, backgroundColor: c }}
        />
      </div>
      {explanation && (
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {explanation}
        </p>
      )}
    </div>
  );
}
