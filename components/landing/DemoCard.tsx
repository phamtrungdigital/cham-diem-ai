import ScoreGauge from "@/components/ScoreGauge";

const sampleContent = [
  "Giảm 50% cho 50+ KHÓA QUẢNG CÁO FACEBOOK",
  "Duy nhất trong tuần khai giảng tại GIGAN Marketing.",
  "Content bí quyết bán đỉnh giá – kịch bản hút lead",
];

const tags = ["11:6 văn chính", "CTR cao", "CPM thấp", "Tăng danh sách"];

export default function DemoCard() {
  return (
    <div className="w-full rounded-[20px] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] md:p-7">
      <div className="rounded-[16px] border border-[var(--color-border)] bg-[#fafbfc] p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--color-text)]">
            Nhập nội dung quảng cáo của bạn
          </span>
          <a
            href="#"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Ví dụ mẫu
          </a>
        </div>

        <div className="mb-4 space-y-2 text-sm leading-relaxed text-[var(--color-text)]">
          <p className="flex items-start gap-2">
            <span aria-hidden>🔥</span>
            <span className="font-medium">{sampleContent[0]}</span>
          </p>
          <p className="text-[var(--color-text-muted)]">{sampleContent[1]}</p>
          <p className="text-[var(--color-text-muted)]">{sampleContent[2]}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md bg-[#e8f3ff] px-2 py-1 text-xs font-medium text-[var(--color-primary)]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2 6.5L4.5 9 10 3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {tag}
            </span>
          ))}
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">208/500</span>
        </div>
      </div>

      <div className="mt-5 rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-[var(--color-text)]">
          Kết quả phân tích
        </p>
        <div className="flex items-center gap-6">
          <ScoreGauge score={82} label="Rất tốt" size="md" />
          <div className="flex flex-1 flex-col gap-3 text-sm">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">CTR dự đoán</p>
              <p className="font-semibold text-[var(--color-primary)]">
                1.4% – 3.6x
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">CPM dự đoán</p>
              <p className="font-semibold text-[var(--color-primary)]">
                280.000đ
                <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
                  /1000 lượt tiếp cận
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
