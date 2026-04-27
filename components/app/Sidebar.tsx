"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { signOut } from "@/lib/auth/actions";

type NavItem = { label: string; href: string; icon: keyof typeof icons };

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "home" },
  { label: "Chấm điểm", href: "/score/new", icon: "spark" },
  { label: "Lịch sử", href: "/history", icon: "clock" },
  { label: "So sánh", href: "/compare", icon: "compare" },
  { label: "Thư viện", href: "/library", icon: "library" },
  { label: "Báo cáo", href: "/reports", icon: "chart" },
  { label: "Cài đặt", href: "/settings", icon: "settings" },
];

const icons = {
  home: (
    <path
      d="M3 9l7-6 7 6v9a1 1 0 01-1 1h-3v-6h-6v6H4a1 1 0 01-1-1V9z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  spark: (
    <path
      d="M10 2l1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8L10 2z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  clock: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 2" />
    </g>
  ),
  compare: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h4v12H5zM11 8h4v8h-4z" />
      <path d="M3 16h14" />
    </g>
  ),
  library: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 8h14M8 3v14" />
    </g>
  ),
  chart: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 17V7M9 17V11M15 17V4" />
      <path d="M2 17h16" />
    </g>
  ),
  settings: (
    <g
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 1.5l1.2 2 2.3-.6.8 2.2 2.2.8-.6 2.3 2 1.2-2 1.2.6 2.3-2.2.8-.8 2.2-2.3-.6-1.2 2-1.2-2-2.3.6-.8-2.2-2.2-.8.6-2.3-2-1.2 2-1.2-.6-2.3 2.2-.8.8-2.2 2.3.6L10 1.5z" />
    </g>
  ),
};

function NavIcon({ name }: { name: keyof typeof icons }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
      {icons[name]}
    </svg>
  );
}

type SidebarProps = {
  userName: string;
  userEmail: string;
};

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="hidden h-screen w-64 flex-shrink-0 flex-col border-r border-[var(--color-border)] bg-white md:flex">
      <div className="px-5 py-5">
        <Link href="/dashboard" aria-label="Dashboard">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-[#e8f3ff] font-medium text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <div className="flex items-center gap-3 rounded-[10px] px-2 py-2">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">
              {userName}
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              {userEmail}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Đăng xuất"
              className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-error)]"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M13 4h2a2 2 0 012 2v8a2 2 0 01-2 2h-2M9 14l-4-4 4-4M5 10h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
