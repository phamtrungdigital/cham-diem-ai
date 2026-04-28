"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isValidModel } from "@/lib/ai/models";

const providerSchema = z.enum(["anthropic", "openai"]);

const saveSchema = z
  .object({
    anthropic_api_key: z
      .string()
      .trim()
      .max(400)
      .regex(
        /^(sk-ant-|)[A-Za-z0-9_\-]*$/,
        "Định dạng key Anthropic không hợp lệ",
      )
      .optional()
      .or(z.literal("")),
    openai_api_key: z
      .string()
      .trim()
      .max(400)
      .regex(/^(sk-|)[A-Za-z0-9_\-]*$/, "Định dạng key OpenAI không hợp lệ")
      .optional()
      .or(z.literal("")),
    default_provider: providerSchema,
    score_provider: providerSchema,
    score_model: z.string().min(1).max(80),
    rewrite_provider: providerSchema,
    rewrite_model: z.string().min(1).max(80),
  })
  .refine((d) => isValidModel(d.score_provider, d.score_model), {
    message: "Model chấm điểm không thuộc danh sách hỗ trợ",
    path: ["score_model"],
  })
  .refine((d) => isValidModel(d.rewrite_provider, d.rewrite_model), {
    message: "Model viết lại không thuộc danh sách hỗ trợ",
    path: ["rewrite_model"],
  });

export type SettingsState = { ok: boolean; message?: string };

export async function saveAiCredentials(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = saveSchema.safeParse({
    anthropic_api_key: (formData.get("anthropic_api_key") ?? "") as string,
    openai_api_key: (formData.get("openai_api_key") ?? "") as string,
    default_provider: formData.get("default_provider"),
    score_provider: formData.get("score_provider"),
    score_model: formData.get("score_model"),
    rewrite_provider: formData.get("rewrite_provider"),
    rewrite_model: formData.get("rewrite_model"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { data: existing } = await supabase
    .from("ai_credentials")
    .select("anthropic_api_key, openai_api_key")
    .eq("user_id", user.id)
    .maybeSingle();

  const next = {
    user_id: user.id,
    anthropic_api_key: parsed.data.anthropic_api_key
      ? parsed.data.anthropic_api_key
      : (existing?.anthropic_api_key ?? null),
    openai_api_key: parsed.data.openai_api_key
      ? parsed.data.openai_api_key
      : (existing?.openai_api_key ?? null),
    default_provider: parsed.data.default_provider,
    score_provider: parsed.data.score_provider,
    score_model: parsed.data.score_model,
    rewrite_provider: parsed.data.rewrite_provider,
    rewrite_model: parsed.data.rewrite_model,
  };

  const { error } = await supabase
    .from("ai_credentials")
    .upsert(next, { onConflict: "user_id" });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  return { ok: true, message: "Đã lưu cài đặt AI" };
}

export async function clearAiKey(provider: "anthropic" | "openai") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const column =
    provider === "anthropic" ? "anthropic_api_key" : "openai_api_key";
  await supabase
    .from("ai_credentials")
    .update({ [column]: null })
    .eq("user_id", user.id);

  revalidatePath("/settings");
}
