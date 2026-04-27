import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ff]">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M11 2l2 6 6 1-4.5 4 1 6-4.5-3-4.5 3 1-6L3 9l6-1 2-6z"
            stroke="var(--color-primary)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-text-muted)]">
        {description}
      </p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
