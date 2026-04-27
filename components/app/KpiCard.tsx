type KpiCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: { delta: string; positive: boolean };
};

export default function KpiCard({ label, value, hint, trend }: KpiCardProps) {
  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[var(--color-text)]">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
            }`}
          >
            {trend.positive ? "▲" : "▼"} {trend.delta}
          </span>
        )}
      </div>
      {hint && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
      )}
    </div>
  );
}
