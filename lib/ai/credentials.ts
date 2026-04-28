import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_MODEL, resolveModel } from "@/lib/ai/models";

export type Provider = "anthropic" | "openai";
export type TaskKind = "score" | "rewrite";

export type TaskConfig = {
  provider: Provider;
  model: string;
};

export type AiCredentialsStatus = {
  anthropic: { hasKey: boolean; lastFour: string | null };
  openai: { hasKey: boolean; lastFour: string | null };
  defaultProvider: Provider;
  score: TaskConfig;
  rewrite: TaskConfig;
  updatedAt: string | null;
};

const EMPTY: AiCredentialsStatus = {
  anthropic: { hasKey: false, lastFour: null },
  openai: { hasKey: false, lastFour: null },
  defaultProvider: "anthropic",
  score: { provider: "anthropic", model: DEFAULT_MODEL.anthropic },
  rewrite: { provider: "anthropic", model: DEFAULT_MODEL.anthropic },
  updatedAt: null,
};

function lastFour(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(-4);
}

function normalizeProvider(value: unknown, fallback: Provider): Provider {
  return value === "anthropic" || value === "openai" ? value : fallback;
}

export async function getAiCredentialsStatus(): Promise<AiCredentialsStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  // eslint-disable-next-line prefer-const
  let { data, error } = await supabase
    .from("ai_credentials")
    .select(
      "anthropic_api_key, openai_api_key, default_provider, score_provider, score_model, rewrite_provider, rewrite_model, updated_at",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  // Migration 0004 not yet applied → fall back to legacy columns so the page
  // still renders the saved keys instead of showing "empty".
  if (error) {
    const fallback = await supabase
      .from("ai_credentials")
      .select(
        "anthropic_api_key, openai_api_key, default_provider, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();
    data = fallback.data as typeof data;
  }

  if (!data) return EMPTY;

  const defaultProvider = normalizeProvider(data.default_provider, "anthropic");
  const scoreProvider = normalizeProvider(data.score_provider, defaultProvider);
  const rewriteProvider = normalizeProvider(
    data.rewrite_provider,
    defaultProvider,
  );

  return {
    anthropic: {
      hasKey: !!data.anthropic_api_key,
      lastFour: lastFour(data.anthropic_api_key),
    },
    openai: {
      hasKey: !!data.openai_api_key,
      lastFour: lastFour(data.openai_api_key),
    },
    defaultProvider,
    score: {
      provider: scoreProvider,
      model: resolveModel(scoreProvider, data.score_model),
    },
    rewrite: {
      provider: rewriteProvider,
      model: resolveModel(rewriteProvider, data.rewrite_model),
    },
    updatedAt: data.updated_at,
  };
}

export async function getProviderKey(
  provider: Provider,
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const column =
    provider === "anthropic" ? "anthropic_api_key" : "openai_api_key";
  const { data } = await supabase
    .from("ai_credentials")
    .select(column)
    .eq("user_id", user.id)
    .maybeSingle();

  const value = (data as Record<string, string | null> | null)?.[column];
  return value ?? null;
}

export async function getTaskConfig(task: TaskKind): Promise<{
  provider: Provider;
  model: string;
  apiKey: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const fallback: Provider = "anthropic";
    return { provider: fallback, model: DEFAULT_MODEL[fallback], apiKey: null };
  }

  let { data } = await supabase
    .from("ai_credentials")
    .select(
      "anthropic_api_key, openai_api_key, default_provider, score_provider, score_model, rewrite_provider, rewrite_model",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) {
    const fallback = await supabase
      .from("ai_credentials")
      .select("anthropic_api_key, openai_api_key, default_provider")
      .eq("user_id", user.id)
      .maybeSingle();
    data = fallback.data as typeof data;
  }

  const defaultProvider = normalizeProvider(
    data?.default_provider,
    "anthropic",
  );
  const provider = normalizeProvider(
    task === "score" ? data?.score_provider : data?.rewrite_provider,
    defaultProvider,
  );
  const model = resolveModel(
    provider,
    task === "score" ? data?.score_model : data?.rewrite_model,
  );
  const apiKey =
    (provider === "anthropic"
      ? data?.anthropic_api_key
      : data?.openai_api_key) ?? null;

  return { provider, model, apiKey };
}
