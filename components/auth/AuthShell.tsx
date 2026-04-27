import Link from "next/link";
import Logo from "@/components/Logo";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="px-6 py-6">
        <Link href="/" aria-label="Về trang chủ">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[440px]">
          <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-card)]">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {subtitle}
              </p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-5 text-center text-sm text-[var(--color-text-muted)]">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
