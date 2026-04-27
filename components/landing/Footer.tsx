import Logo from "@/components/Logo";

const columns = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Tính năng", href: "#features" },
      { label: "Bảng giá", href: "#pricing" },
      { label: "Dùng thử miễn phí", href: "/register" },
    ],
  },
  {
    title: "Tài nguyên",
    links: [
      { label: "Blog", href: "#blog" },
      { label: "Hướng dẫn", href: "#guides" },
      { label: "Ví dụ mẫu", href: "#examples" },
    ],
  },
  {
    title: "Công ty",
    links: [
      { label: "Giới thiệu", href: "#about" },
      { label: "Liên hệ", href: "#contact" },
      { label: "Chính sách bảo mật", href: "#privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white px-6 py-12">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1.5fr_repeat(3,_1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
            AI chấm điểm nội dung quảng cáo Facebook, giúp bạn tăng CTR, giảm
            CPM và tối ưu ngân sách.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="mb-4 text-sm font-semibold text-[var(--color-text)]">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-[1200px] flex-col items-start justify-between gap-2 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-text-muted)] md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Facebook Ads Content Score. All rights reserved.</p>
        <p>Made with care for performance marketers.</p>
      </div>
    </footer>
  );
}
