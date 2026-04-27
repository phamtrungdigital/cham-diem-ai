import Link from "next/link";
import Logo from "@/components/Logo";

const navLinks = [
  { label: "Tính năng", href: "#features" },
  { label: "Tài nguyên", href: "#resources" },
  { label: "Blog", href: "#blog" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
        <Link href="/" aria-label="Facebook Ads Content Score">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-text)] transition-colors hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Dùng thử miễn phí
        </Link>
      </div>
    </header>
  );
}
