type ScoreGaugeProps = {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
};

function tone(score: number) {
  if (score >= 80) return { stroke: "#10b981", text: "var(--color-text)" };
  if (score >= 60) return { stroke: "#f59e0b", text: "var(--color-text)" };
  return { stroke: "#ef4444", text: "var(--color-text)" };
}

export default function ScoreGauge({
  score,
  label,
  size = "md",
}: ScoreGaugeProps) {
  const dimensions = {
    sm: { box: 84, stroke: 7, valueClass: "text-xl", labelClass: "text-[10px]" },
    md: { box: 120, stroke: 9, valueClass: "text-3xl", labelClass: "text-xs" },
    lg: { box: 152, stroke: 10, valueClass: "text-4xl", labelClass: "text-sm" },
  }[size];

  const { box, stroke, valueClass, labelClass } = dimensions;
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(score, 0), 100) / 100);
  const { stroke: color } = tone(score);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: box, height: box }}
      role="img"
      aria-label={`Điểm ${score}/100${label ? ` — ${label}` : ""}`}
    >
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          stroke="var(--color-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${valueClass} font-semibold tracking-tight text-[var(--color-text)]`}>
          {score}
          <span className="text-[var(--color-text-muted)] text-base font-medium">
            /100
          </span>
        </span>
        {label && (
          <span
            className={`${labelClass} font-medium`}
            style={{ color }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
