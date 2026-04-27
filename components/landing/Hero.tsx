import Link from "next/link";
import DemoCard from "@/components/landing/DemoCard";

const trustItems = [
  { label: "Không cần thẻ tín dụng", icon: "card" },
  { label: "Thiết lập nhanh", icon: "check" },
  { label: "Hỗ trợ 24/7", icon: "headset" },
];

const TrustIcon = ({ name }: { name: string }) => {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    "aria-hidden": true,
  };
  if (name === "card")
    return (
      <svg {...common}>
        <rect
          x="2"
          y="4"
          width="12"
          height="9"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  if (name === "headset")
    return (
      <svg {...common}>
        <path
          d="M3 9V8a5 5 0 0110 0v1m-10 0a1 1 0 011-1h1v3H4a1 1 0 01-1-1V9zm10 0a1 1 0 00-1-1h-1v3h1a1 1 0 001-1V9zm-1 2v.5a2 2 0 01-2 2H8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg {...common}>
      <path
        d="M3 8l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function Hero() {
  return (
    <section className="relative px-6 pb-16 pt-12 md:pb-24 md:pt-16">
      <div className="absolute left-0 top-12 -z-10 hidden h-72 w-72 opacity-50 md:block">
        <div className="grid h-full w-full grid-cols-12 gap-3">
          {Array.from({ length: 144 }).map((_, i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-[var(--color-border)]"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[minmax(0,_1fr)_minmax(0,_540px)] lg:gap-16">
        <div>
          <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-[var(--color-text)] md:text-[52px]">
            Chấm điểm
            <br />
            Facebook Ads
            <br />
            trước khi{" "}
            <span className="text-[var(--color-primary)]">đốt tiền</span>
            <br />
            quảng cáo
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-text-muted)] md:text-lg">
            AI phân tích nội dung, dự đoán hiệu quả và gợi ý cải thiện để tăng
            CTR, giảm CPM và tối ưu ngân sách.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-6 text-sm font-medium text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Dùng thử miễn phí
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M2 7h10m0 0L8 3m4 4l-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-border)] bg-white px-6 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6.5 5.5l4 2.5-4 2.5v-5z" fill="currentColor" />
              </svg>
              Xem demo
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-muted)]">
            {trustItems.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className="text-[var(--color-primary)]">
                  <TrustIcon name={item.icon} />
                </span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:max-w-[540px]">
          <DemoCard />
        </div>
      </div>
    </section>
  );
}
