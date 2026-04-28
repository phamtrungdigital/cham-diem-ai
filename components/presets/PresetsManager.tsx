"use client";

import { useState, useTransition } from "react";
import {
  deletePreset,
  renamePreset,
  updatePresetContent,
  type Preset,
  type PresetScope,
} from "@/lib/presets/actions";

type Props = {
  initialScore: Preset[];
  initialRewrite: Preset[];
};

export default function PresetsManager({
  initialScore,
  initialRewrite,
}: Props) {
  const [score, setScore] = useState<Preset[]>(initialScore);
  const [rewrite, setRewrite] = useState<Preset[]>(initialRewrite);

  const updateInScope = (
    scope: PresetScope,
    updater: (list: Preset[]) => Preset[],
  ) => {
    if (scope === "score") setScore(updater);
    else setRewrite(updater);
  };

  return (
    <div className="space-y-6">
      <ScopeSection
        scope="score"
        title="Chấm điểm"
        description="Mẫu áp dụng cho ô Thông tin bổ sung khi chấm điểm content."
        list={score}
        onChange={(updater) => updateInScope("score", updater)}
      />
      <ScopeSection
        scope="rewrite"
        title="Viết lại"
        description="Mẫu áp dụng cho ô Thông tin bổ sung khi viết lại content."
        list={rewrite}
        onChange={(updater) => updateInScope("rewrite", updater)}
      />
    </div>
  );
}

function ScopeSection({
  scope,
  title,
  description,
  list,
  onChange,
}: {
  scope: PresetScope;
  title: string;
  description: string;
  list: Preset[];
  onChange: (updater: (list: Preset[]) => Preset[]) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">
          {list.length}/20
        </span>
      </div>

      {list.length === 0 ? (
        <p className="rounded-[10px] border border-dashed border-[var(--color-border)] bg-[#fafbff] px-3 py-3 text-xs text-[var(--color-text-muted)]">
          Chưa có mẫu nào. Vào trang {scope === "score" ? "Chấm điểm" : "Viết lại"},
          điền nội dung rồi nhấn &ldquo;Lưu thành mẫu&rdquo; để tạo mẫu đầu tiên.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <PresetRow
              key={p.id}
              preset={p}
              onUpdated={(next) =>
                onChange((l) => l.map((it) => (it.id === next.id ? next : it)))
              }
              onDeleted={() =>
                onChange((l) => l.filter((it) => it.id !== p.id))
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function PresetRow({
  preset,
  onUpdated,
  onDeleted,
}: {
  preset: Preset;
  onUpdated: (next: Preset) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(preset.name);
  const [content, setContent] = useState(preset.content);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = name.trim() !== preset.name || content.trim() !== preset.content;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      let next: Preset = preset;
      if (name.trim() !== preset.name) {
        const r = await renamePreset({ id: preset.id, name: name.trim() });
        if (!r.ok) {
          setError(r.message);
          return;
        }
        next = r.preset;
      }
      if (content.trim() !== preset.content) {
        const r = await updatePresetContent({
          id: preset.id,
          content: content.trim(),
        });
        if (!r.ok) {
          setError(r.message);
          return;
        }
        next = r.preset;
      }
      onUpdated(next);
      setExpanded(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Xoá mẫu "${preset.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const r = await deletePreset(preset.id);
      if (!r.ok) {
        setError(r.message ?? "Lỗi xoá");
        return;
      }
      onDeleted();
    });
  };

  return (
    <li className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="h-9 flex-1 rounded-[8px] border border-transparent bg-white px-3 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[var(--color-border)] bg-white px-3 text-xs text-[var(--color-text)] hover:border-[var(--color-primary)]"
        >
          {expanded ? "Thu gọn" : "Sửa nội dung"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#fecaca] bg-white px-3 text-xs text-[#b91c1c] hover:bg-[#fef2f2] disabled:opacity-50"
        >
          Xoá
        </button>
      </div>

      {expanded && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={3000}
          className="mt-2 block w-full rounded-[8px] border border-[var(--color-border)] bg-white p-3 text-xs leading-relaxed text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      )}

      {dirty && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex h-8 items-center justify-center rounded-[8px] bg-[var(--color-primary)] px-3 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {pending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => {
              setName(preset.name);
              setContent(preset.content);
              setError(null);
            }}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Huỷ
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p>
      )}
    </li>
  );
}
