"use client";

import { useActionState, useState } from "react";
import SubmitButton from "@/components/auth/SubmitButton";
import {
  saveAiCredentials,
  type SettingsState,
} from "@/lib/settings/actions";
import type {
  AiCredentialsStatus,
  Provider,
} from "@/lib/ai/credentials";
import { MODEL_CATALOG, DEFAULT_MODEL } from "@/lib/ai/models";

const initial: SettingsState = { ok: false };

const providers: { value: Provider; label: string; subtitle: string }[] = [
  {
    value: "anthropic",
    label: "Anthropic Claude",
    subtitle: "Khuyến nghị cho chấm điểm và viết lại content",
  },
  {
    value: "openai",
    label: "OpenAI GPT",
    subtitle: "Phù hợp khi bạn đã có credit OpenAI",
  },
];

type ProviderKeyFieldProps = {
  label: string;
  name: string;
  placeholder: string;
  hint: string;
  link: { href: string; text: string };
  status: { hasKey: boolean; lastFour: string | null };
};

function ProviderKeyField({
  label,
  name,
  placeholder,
  hint,
  link,
  status,
}: ProviderKeyFieldProps) {
  const [show, setShow] = useState(!status.hasKey);

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            {label}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {hint}{" "}
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              {link.text} ↗
            </a>
          </p>
        </div>
        {status.hasKey && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium text-[#15803d]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />
            Đã lưu · ••••{status.lastFour}
          </span>
        )}
      </div>

      {show ? (
        <div className="mt-3">
          <input
            type="password"
            name={name}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="block h-11 w-full rounded-[12px] border border-[var(--color-border)] bg-white px-3.5 font-mono text-sm text-[var(--color-text)] placeholder:font-sans placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          {status.hasKey && (
            <button
              type="button"
              onClick={() => setShow(false)}
              className="mt-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Huỷ thay đổi
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-xs font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Thay key mới
        </button>
      )}
    </div>
  );
}

type TaskModelPickerProps = {
  title: string;
  description: string;
  providerName: string;
  modelName: string;
  initialProvider: Provider;
  initialModel: string;
};

function TaskModelPicker({
  title,
  description,
  providerName,
  modelName,
  initialProvider,
  initialModel,
}: TaskModelPickerProps) {
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [model, setModel] = useState<string>(initialModel);

  const handleProviderChange = (next: Provider) => {
    if (next === provider) return;
    setProvider(next);
    const stillValid = MODEL_CATALOG[next].some((m) => m.id === model);
    if (!stillValid) setModel(DEFAULT_MODEL[next]);
  };

  const options = MODEL_CATALOG[provider];

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
      <p className="text-sm font-semibold text-[var(--color-text)]">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
        {description}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {providers.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => handleProviderChange(p.value)}
            className={`rounded-[10px] border px-3 py-2 text-left text-xs font-medium transition-colors ${
              provider === p.value
                ? "border-[var(--color-primary)] bg-[#e8f3ff] text-[var(--color-text)]"
                : "border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="mt-3 block text-xs font-medium text-[var(--color-text-muted)]">
        Model
      </label>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="mt-1 block h-11 w-full rounded-[12px] border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      >
        {options.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
        {options.find((m) => m.id === model)?.tagline ?? ""}
      </p>

      <input type="hidden" name={providerName} value={provider} />
      <input type="hidden" name={modelName} value={model} />
    </div>
  );
}

export default function AiKeysForm({
  status,
}: {
  status: AiCredentialsStatus;
}) {
  const [state, action] = useActionState(saveAiCredentials, initial);
  const [defaultProvider, setDefaultProvider] = useState<Provider>(
    status.defaultProvider,
  );

  return (
    <form action={action} className="space-y-5">
      <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">
          AI mặc định
        </p>
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          Provider mặc định khi tác vụ chưa có cấu hình riêng.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {providers.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setDefaultProvider(p.value)}
              className={`flex flex-col items-start rounded-[12px] border p-4 text-left transition-colors ${
                defaultProvider === p.value
                  ? "border-[var(--color-primary)] bg-[#e8f3ff]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
              }`}
            >
              <span className="text-sm font-semibold text-[var(--color-text)]">
                {p.label}
              </span>
              <span className="mt-1 text-xs text-[var(--color-text-muted)]">
                {p.subtitle}
              </span>
            </button>
          ))}
        </div>
        <input
          type="hidden"
          name="default_provider"
          value={defaultProvider}
        />
      </div>

      <TaskModelPicker
        title="Model chấm điểm"
        description="Dùng cho phân tích & cho điểm content. Nên ưu tiên model có khả năng suy luận tốt."
        providerName="score_provider"
        modelName="score_model"
        initialProvider={status.score.provider}
        initialModel={status.score.model}
      />

      <TaskModelPicker
        title="Model viết lại"
        description="Dùng cho viết lại content theo gợi ý. Có thể chọn model khác với model chấm điểm."
        providerName="rewrite_provider"
        modelName="rewrite_model"
        initialProvider={status.rewrite.provider}
        initialModel={status.rewrite.model}
      />

      <ProviderKeyField
        label="Anthropic API key"
        name="anthropic_api_key"
        placeholder="sk-ant-..."
        hint="Để dùng Claude cho chấm điểm và viết lại content."
        link={{
          href: "https://console.anthropic.com/settings/keys",
          text: "Lấy key tại Anthropic Console",
        }}
        status={status.anthropic}
      />

      <ProviderKeyField
        label="OpenAI API key"
        name="openai_api_key"
        placeholder="sk-..."
        hint="Tuỳ chọn — dùng GPT thay Claude."
        link={{
          href: "https://platform.openai.com/api-keys",
          text: "Lấy key tại OpenAI Platform",
        }}
        status={status.openai}
      />

      {state.message && (
        <p
          className={`rounded-md border px-3 py-2 text-xs ${
            state.ok
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]"
              : "border-[#fee2e2] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-xs leading-relaxed text-[#92400e]">
        🔐 Key của anh chỉ dùng cho tài khoản của anh, lưu ở Supabase với RLS
        chặn user khác đọc, và chỉ được sử dụng từ server (không bao giờ gửi về
        trình duyệt). Để trống ô input nếu muốn giữ key cũ.
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <SubmitButton label="Lưu cài đặt" />
        </div>
      </div>
    </form>
  );
}
