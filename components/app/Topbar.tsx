import Link from "next/link";

type Crumb = { label: string; href?: string };

type TopbarProps = {
  crumbs?: Crumb[];
  title?: string;
};

export default function Topbar({ crumbs, title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white/90 px-6 backdrop-blur">
      <div className="min-w-0 flex-1">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link
                    href={c.href}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--color-text)]">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && (
                  <span className="text-[var(--color-text-muted)]">/</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="truncate text-base font-semibold text-[var(--color-text)]">
            {title}
          </h1>
        ) : null}
      </div>

      <Link
        href="/score/new"
        className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-primary)] px-4 text-sm font-medium text-white shadow-[0_2px_6px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 1l1.6 4 4.4.4-3.4 3 1 4.3L7 10.6 3.4 12.7l1-4.3L1 5.4 5.4 5 7 1z"
            fill="currentColor"
          />
        </svg>
        <span className="hidden sm:inline">Chấm điểm content mới</span>
        <span className="sm:hidden">Chấm điểm mới</span>
      </Link>
    </header>
  );
}
