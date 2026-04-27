import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="px-6 pb-16 md:pb-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[24px] bg-[var(--color-primary)] px-8 py-7 md:flex-row md:items-center md:px-10">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"
                  fill="white"
                />
              </svg>
            </span>
            <div>
              <h3 className="text-xl font-semibold text-white md:text-2xl">
                Tối ưu content trước khi chạy ads
              </h3>
              <p className="mt-1 text-sm text-white/85 md:text-base">
                Tiết kiệm ngân sách – Tăng hiệu quả chiến dịch
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-white px-6 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition-transform hover:scale-[1.02]"
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
        </div>
      </div>
    </section>
  );
}
