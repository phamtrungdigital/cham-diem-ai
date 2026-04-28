"use client";

import { useState, useTransition } from "react";
import {
  createPreset,
  type Preset,
  type PresetScope,
} from "@/lib/presets/actions";

const MAX_PER_SCOPE = 20;

type Props = {
  scope: PresetScope;
  /** When set, the textarea participates in form submission with this name.
   *  Omit if the parent form already has a hidden input handling the value. */
  name?: string;
  value: string;
  onChange: (next: string) => void;
  initialPresets: Preset[];
  rows?: number;
  max?: number;
  placeholder?: string;
  textareaClassName?: string;
};

export default function PresetTextarea({
  scope,
  name,
  value,
  onChange,
  initialPresets,
  rows = 6,
  max = 2000,
  placeholder,
  textareaClassName,
}: Props) {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savingError, setSavingError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const len = value.length;
  const reachedLimit = presets.length >= MAX_PER_SCOPE;

  const handleApply = (id: string) => {
    if (!id) return;
    const found = presets.find((p) => p.id === id);
    if (found) onChange(found.content);
  };

  const handleSave = () => {
    setSavingError(null);
    const trimmedName = presetName.trim();
    const trimmedContent = value.trim();
    if (!trimmedName) {
      setSavingError("Đặt tên cho mẫu trước");
      return;
    }
    if (!trimmedContent) {
      setSavingError("Nội dung trống — không có gì để lưu");
      return;
    }
    if (reachedLimit) {
      setSavingError(`Đã đạt giới hạn ${MAX_PER_SCOPE} mẫu`);
      return;
    }

    startTransition(async () => {
      const result = await createPreset({
        scope,
        name: trimmedName,
        content: trimmedContent,
      });
      if (result.ok) {
        setPresets([result.preset, ...presets]);
        setPresetName("");
        setShowSave(false);
      } else {
        setSavingError(result.message);
      }
    });
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <select
          value=""
          onChange={(e) => {
            handleApply(e.target.value);
            e.currentTarget.value = "";
          }}
          disabled={presets.length === 0}
          className="h-9 max-w-[260px] flex-1 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--color-bg)] disabled:text-[var(--color-text-muted)]"
        >
          <option value="">
            {presets.length === 0
              ? "— Chưa có mẫu nào —"
              : `— Áp dụng mẫu (${presets.length}/${MAX_PER_SCOPE}) —`}
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowSave((s) => !s)}
          disabled={value.trim().length === 0 || reachedLimit}
          className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          title={
            reachedLimit
              ? `Đã đạt ${MAX_PER_SCOPE} mẫu — xoá bớt ở Cài đặt`
              : "Lưu nội dung hiện tại thành mẫu để dùng lại"
          }
        >
          💾 {showSave ? "Huỷ" : "Lưu thành mẫu"}
        </button>
      </div>

      {showSave && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-[10px] border border-dashed border-[var(--color-border)] bg-[#fafbff] p-2.5">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Đặt tên mẫu (vd: Giáo dục - phụ huynh)"
            maxLength={80}
            className="h-9 min-w-[200px] flex-1 rounded-[8px] border border-[var(--color-border)] bg-white px-3 text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-3 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Đang lưu..." : "Lưu"}
          </button>
          {savingError && (
            <p className="basis-full text-xs text-[var(--color-error)]">
              {savingError}
            </p>
          )}
        </div>
      )}

      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          textareaClassName ??
          "block w-full rounded-[12px] border border-[var(--color-border)] bg-white p-3.5 text-sm leading-relaxed text-[var(--color-text)] placeholder:whitespace-pre-line placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        }
      />
      <p
        className={`mt-1 text-right text-[11px] ${
          len > max
            ? "text-[var(--color-error)]"
            : "text-[var(--color-text-muted)]"
        }`}
      >
        {len}/{max}
      </p>
    </div>
  );
}
