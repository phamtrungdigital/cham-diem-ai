import type { Provider } from "@/lib/ai/credentials";

export type TaskKind = "score" | "rewrite";

export type ModelOption = {
  id: string;
  label: string;
  tagline: string;
  recommended?: TaskKind[];
};

export const MODEL_CATALOG: Record<Provider, ModelOption[]> = {
  anthropic: [
    {
      id: "claude-opus-4-7",
      label: "Claude Opus 4.7",
      tagline: "Mạnh nhất – chấm điểm khó, viết lại tinh tế (đắt)",
    },
    {
      id: "claude-sonnet-4-6",
      label: "Claude Sonnet 4.6",
      tagline: "Cân bằng tốc độ / chất lượng – mặc định khuyên dùng",
      recommended: ["score", "rewrite"],
    },
    {
      id: "claude-haiku-4-5",
      label: "Claude Haiku 4.5",
      tagline: "Nhanh & rẻ – phù hợp chấm điểm hàng loạt",
    },
  ],
  openai: [
    {
      id: "gpt-4.1",
      label: "GPT-4.1",
      tagline: "Mạnh nhất của OpenAI – viết lại chất lượng cao",
    },
    {
      id: "gpt-4.1-mini",
      label: "GPT-4.1 mini",
      tagline: "Nhanh & rẻ – chấm điểm hàng loạt",
      recommended: ["score"],
    },
    {
      id: "gpt-4o",
      label: "GPT-4o",
      tagline: "Đa năng, cân bằng",
    },
    {
      id: "gpt-4o-mini",
      label: "GPT-4o mini",
      tagline: "Nhỏ gọn, rẻ nhất",
    },
    {
      id: "o4-mini",
      label: "o4-mini",
      tagline: "Reasoning – tốt cho phân tích logic phức tạp",
    },
  ],
};

export const DEFAULT_MODEL: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o-mini",
};

export function isValidModel(provider: Provider, model: string): boolean {
  return MODEL_CATALOG[provider].some((m) => m.id === model);
}

export function resolveModel(
  provider: Provider,
  requested: string | null | undefined,
): string {
  if (requested && isValidModel(provider, requested)) return requested;
  return DEFAULT_MODEL[provider];
}
