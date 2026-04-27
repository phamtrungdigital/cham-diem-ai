"use client";

import { useActionState, useState } from "react";
import { startScoring, type ScoreState } from "@/lib/score/actions";

const objectives = [
  "Tăng nhận diện",
  "Tăng tương tác",
  "Tin nhắn",
  "Thu lead",
  "Traffic",
  "Chuyển đổi",
  "Remarketing",
];

const initial: ScoreState = { ok: false };

export default function QuickScoreForm() {
  const [state, action, pending] = useActionState(startScoring, initial);
  const [content, setContent] = useState("");
  const [showOptional, setShowOptional] = useState(false);

  const len = content.length;
  const tooShort = len > 0 && len < 20;
  const tooLong = len > 5000;

  if (pending) {
    return <AnalyzingState />;
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="content"
            className="block text-sm font-semibold text-[var(--color-text)]"
          >
            Dán nội dung quảng cáo của bạn
          </label>
          <span
            className={`text-xs ${
              tooLong
                ? "text-[var(--color-error)]"
                : tooShort
                ? "text-[var(--color-warning)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {len}/5000 ký tự
          </span>
        </div>
        <textarea
          id="content"
          name="content"
          required
          rows={9}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dán caption, headline, script video hoặc nội dung quảng cáo Facebook vào đây..."
          className="block w-full rounded-[16px] border border-[var(--color-border)] bg-white p-4 text-sm leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        {tooShort && (
          <p className="mt-1 text-xs text-[var(--color-warning)]">
            Cần ít nhất 20 ký tự để AI có đủ ngữ cảnh
          </p>
        )}
      </div>

      <div className="rounded-[16px] border border-dashed border-[var(--color-border)] bg-white">
        <button
          type="button"
          onClick={() => setShowOptional((s) => !s)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
        >
          <span>
            Thông tin bổ sung{" "}
            <span className="font-normal text-[var(--color-text-muted)]">
              (không bắt buộc)
            </span>
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={`transition-transform ${showOptional ? "rotate-180" : ""}`}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {showOptional && (
          <div className="space-y-3 border-t border-[var(--color-border)] px-5 py-4">
            <OptionalSelect
              label="Mục tiêu quảng cáo"
              name="objective"
              options={objectives}
            />
            <OptionalInput
              label="Đối tượng mục tiêu"
              name="audience"
              placeholder="Ví dụ: chủ shop online, phụ huynh có con lớp 9, nữ 25-35..."
            />
            <OptionalInput
              label="Ngành hàng"
              name="industry"
              placeholder="Ví dụ: giáo dục, nha khoa, spa, phần mềm, bất động sản..."
            />
            <OptionalInput
              label="Link landing page"
              name="landing_page"
              type="url"
              placeholder="https://yourwebsite.com/landing-page"
            />
            <p className="pt-1 text-xs text-[var(--color-text-muted)]">
              Các trường này giúp AI đánh giá chính xác hơn. Nếu để trống, AI
              sẽ tự suy luận từ content đã dán.
            </p>
          </div>
        )}
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={tooShort || tooLong || len === 0}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-6 text-sm font-medium text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M8 1l2 5 5 1-3.5 3.5 1 5L8 12l-4.5 3.5 1-5L1 7l5-1L8 1z"
              fill="currentColor"
            />
          </svg>
          AI đọc & chấm điểm
        </button>
      </div>
    </form>
  );
}

function OptionalInput({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--color-text)]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="block h-10 w-full rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
    </label>
  );
}

function OptionalSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--color-text)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue=""
        className="block h-10 w-full rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      >
        <option value="">— Chọn mục tiêu —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

const ANALYZING_STEPS = [
  "Đang đọc nội dung",
  "Đang nhận diện Hook & Offer",
  "Đang phân tích CTA và tone of voice",
  "Đang chấm điểm theo 9 tiêu chí",
  "Đang kiểm tra rủi ro chính sách",
  "Đang tổng hợp kết quả",
];

function AnalyzingState() {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ff]">
        <span className="block h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">
        AI đang phân tích content của bạn...
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Quá trình này thường mất 10-20 giây.
      </p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
        {ANALYZING_STEPS.map((s, i) => (
          <li
            key={s}
            className="flex items-center gap-2.5 text-[var(--color-text-muted)]"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
