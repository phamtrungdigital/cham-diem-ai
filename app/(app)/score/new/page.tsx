import Link from "next/link";
import Topbar from "@/components/app/Topbar";

export const metadata = { title: "Chấm điểm content mới" };

export default function NewScorePage() {
  return (
    <>
      <Topbar
        crumbs={[
          { label: "Chấm điểm", href: "/score/new" },
          { label: "Chọn chế độ" },
        ]}
      />
      <main className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[var(--color-text)]">
              Chọn chế độ chấm điểm
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Bạn có thể dán content sẵn để AI tự đọc, hoặc nhập có hướng dẫn
              để AI phân tích chi tiết hơn.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/score/new/quick"
              className="group relative flex flex-col rounded-[20px] border-2 border-[var(--color-primary)] bg-white p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              <span className="absolute -top-2 left-6 rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-semibold text-white">
                Đề xuất
              </span>
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f3ff] text-[var(--color-primary)]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M10 2l2.4 5.6L18 8.5l-4.4 3.9 1.2 5.7L10 15l-4.8 3.1 1.2-5.7L2 8.5l5.6-.9L10 2z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Chấm nhanh bằng content có sẵn
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Dán content của bạn vào, AI tự đọc và chấm điểm trong vài giây.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-text)]">
                {[
                  "Dán nội dung từ bên ngoài",
                  "AI tự đọc và hiểu nội dung",
                  "AI tự nhận diện Hook, Offer, CTA",
                  "Kiểm tra nhanh trước khi chạy ads",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 flex-shrink-0 text-[var(--color-success)]"
                    >
                      <path
                        d="M3 8l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] group-hover:bg-[var(--color-primary-hover)]">
                Tiếp tục
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>

            <Link
              href="/score/new/guided"
              className="group flex flex-col rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40"
            >
              <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] group-hover:bg-[#e8f3ff] group-hover:text-[var(--color-primary)]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M3 5h14M3 10h14M3 15h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Nhập có hướng dẫn theo quy trình
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Form 4 bước — khai báo sản phẩm, USP, offer, bằng chứng. AI
                chấm với context đầy đủ → kết quả chính xác hơn.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-text)]">
                {[
                  "Hướng dẫn từng bước",
                  "Phù hợp người mới hoặc content quan trọng",
                  "Khai báo sản phẩm / USP / offer / bằng chứng",
                  "AI chấm và viết lại sát thực tế hơn",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 flex-shrink-0 text-[var(--color-success)]"
                    >
                      <path
                        d="M3 8l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-border)] bg-white px-5 text-sm font-medium text-[var(--color-text)] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)]">
                Bắt đầu hướng dẫn
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
