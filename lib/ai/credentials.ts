import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Provider = "anthropic" | "openai";

export type AiCredentialsStatus = {
  anthropic: { hasKey: boolean; lastFour: string | null };
  openai: { hasKey: boolean; lastFour: string | null };
  defaultProvider: Provider;
  updatedAt: string | null;
};

const EMPTY: AiCredentialsStatus = {
  anthropic: { hasKey: false, lastFour: null },
  openai: { hasKey: false, lastFour: null },
  defaultProvider: "anthropic",
  updatedAt: null,
};

function lastFour(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(-4);
}

export async function getAiCredentialsStatus(): Promise<AiCredentialsStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY;

  const { data, error } = await supabase
    .from("ai_credentials")
    .select("anthropic_api_key, openai_api_key, default_provider, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return EMPTY;

  return {
    anthropic: {
      hasKey: !!data.anthropic_api_key,
      lastFour: lastFour(data.anthropic_api_key),
    },
    openai: {
      hasKey: !!data.openai_api_key,
      lastFour: lastFour(data.openai_api_key),
    },
    defaultProvider: (data.default_provider as Provider) ?? "anthropic",
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
