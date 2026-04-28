"use client";

import { useActionState, useState } from "react";
import { rewriteScore, type ScoreState } from "@/lib/score/actions";
import {
  REWRITE_TONES,
  REWRITE_LENGTHS,
  REWRITE_SALES_LEVELS,
  REWRITE_GOALS,
} from "@/lib/ai/schemas";
import PresetTextarea from "@/components/presets/PresetTextarea";
import type { Preset } from "@/lib/presets/actions";

const initial: ScoreState = { ok: false };

const STEPS = [
  "Đang đọc bản gốc",
  "Đang xác định góc tối ưu",
  "Đang viết lại theo tuỳ chọn",
  "Đang chấm điểm bản mới",
  "Đang tổng hợp so sánh",
];

function Pill<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`inline-flex h-9 items-center rounded-full border px-3.5 text-xs font-medium transition-colors ${
              value === o
                ? "border-[var(--color-primary)] bg-[#e8f3ff] text-[var(--color-primary)]"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </>
  );
}

const EXTRA_PLACEHOLDER = `Ví dụ giúp AI viết sát thực tế hơn:
- Sản phẩm/dịch vụ: Khoá học IELTS 6.5+ cho người đi làm
- Offer cụ thể: Giảm 40% trong 7 ngày, tặng 4 buổi 1-1, học phí từ 4.9tr
- Bằng chứng thật: 1.200 học viên đậu IELTS 7.0+, đối tác British Council
- USP / khác biệt: Lớp tối 2 buổi/tuần, cam kết hoàn 100% nếu không đạt band
- Tone brand: gần gũi, không "anh chị" cứng nhắc
- Cấm dùng: từ "đảm bảo 100%", không claim sức khoẻ`;

export default function RewriteOptions({
  contentItemId,
  presets,
}: {
  contentItemId: string;
  presets: Preset[];
}) {
  const [state, action, pending] = useActionState(rewriteScore, initial);
  const [tone, setTone] = useState<(typeof REWRITE_TONES)[number]>(
    "Chuyên nghiệp",
  );
  const [length, setLength] = useState<(typeof REWRITE_LENGTHS)[number]>(
    "Trung bình",
  );
  const [salesLevel, setSalesLevel] = useState<
    (typeof REWRITE_SALES_LEVELS)[number]
  >("Vừa");
  const [goal, setGoal] = useState<(typeof REWRITE_GOALS)[number]>(
    "Tăng CTR",
  );
  const [extra, setExtra] = useState("");

  if (pending) {
    return (
      <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ff]">
          <span className="block h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text)]">
          AI đang viết lại content...
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Quá trình này thường mất 15-25 giây.
        </p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
          {STEPS.map((s) => (
            <li
              key={s}
              className="flex items-center gap-2.5 text-[var(--color-text-muted)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="content_item_id" value={contentItemId} />

      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
          Giọng văn
        </p>
        <Pill
          name="tone"
          options={REWRITE_TONES}
          value={tone}
          onChange={setTone}
        />
      </div>

      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
          Độ dài
        </p>
        <Pill
          name="length"
          options={REWRITE_LENGTHS}
          value={length}
          onChange={setLength}
        />
      </div>

      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
          Mức độ bán hàng
        </p>
        <Pill
          name="sales_level"
          options={REWRITE_SALES_LEVELS}
          value={salesLevel}
          onChange={setSalesLevel}
        />
      </div>

      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
          Mục tiêu tối ưu
        </p>
        <Pill
          name="optimization_goal"
          options={REWRITE_GOALS}
          value={goal}
          onChange={setGoal}
        />
      </div>

      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
          Thông tin bổ sung{" "}
          <span className="font-normal text-[var(--color-text-muted)]">
            (tuỳ chọn — giúp AI viết cụ thể hơn)
          </span>
        </p>
        <PresetTextarea
          scope="rewrite"
          name="extra_context"
          value={extra}
          onChange={setExtra}
          initialPresets={presets}
          rows={6}
          max={2000}
          placeholder={EXTRA_PLACEHOLDER}
        />
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
          Càng cụ thể càng giúp AI viết bản tốt hơn — sản phẩm, offer, số liệu
          thật, USP, bằng chứng. Nếu để trống, AI chỉ dựa vào content gốc.
        </p>
      </div>

      {state.message && !state.ok && (
        <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-6 text-sm font-medium text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M8 1l2 5 5 1-3.5 3.5 1 5L8 12l-4.5 3.5 1-5L1 7l5-1L8 1z"
              fill="currentColor"
            />
          </svg>
          Tạo bản viết lại
        </button>
      </div>
    </form>
  );
}
