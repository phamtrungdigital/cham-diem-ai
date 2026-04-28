"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type PresetScope = "score" | "rewrite";

export type Preset = {
  id: string;
  name: string;
  content: string;
  scope: PresetScope;
  updated_at: string;
};

const MAX_PER_SCOPE = 20;

const scopeSchema = z.enum(["score", "rewrite"]);
const nameSchema = z.string().trim().min(1, "Tên mẫu không được trống").max(80);
const contentSchema = z
  .string()
  .trim()
  .min(1, "Nội dung mẫu không được trống")
  .max(3000, "Nội dung mẫu tối đa 3000 ký tự");

export async function listPresets(scope: PresetScope): Promise<Preset[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("context_presets")
    .select("id, name, content, scope, updated_at")
    .eq("user_id", user.id)
    .eq("scope", scope)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as Preset[];
}

export async function listAllPresets(): Promise<Preset[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("context_presets")
    .select("id, name, content, scope, updated_at")
    .eq("user_id", user.id)
    .order("scope", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as Preset[];
}

export type PresetActionResult =
  | { ok: true; preset: Preset }
  | { ok: false; message: string };

const createSchema = z.object({
  scope: scopeSchema,
  name: nameSchema,
  content: contentSchema,
});

export async function createPreset(input: {
  scope: PresetScope;
  name: string;
  content: string;
}): Promise<PresetActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { count } = await supabase
    .from("context_presets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("scope", parsed.data.scope);

  if ((count ?? 0) >= MAX_PER_SCOPE) {
    return {
      ok: false,
      message: `Đã đạt giới hạn ${MAX_PER_SCOPE} mẫu cho phần này. Xoá bớt mẫu cũ ở trang Cài đặt → Mẫu thông tin.`,
    };
  }

  const { data, error } = await supabase
    .from("context_presets")
    .insert({
      user_id: user.id,
      scope: parsed.data.scope,
      name: parsed.data.name,
      content: parsed.data.content,
    })
    .select("id, name, content, scope, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Lỗi lưu mẫu" };
  }

  revalidatePath("/settings/presets");
  return { ok: true, preset: data as Preset };
}

const renameSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
});

export async function renamePreset(input: {
  id: string;
  name: string;
}): Promise<PresetActionResult> {
  const parsed = renameSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { data, error } = await supabase
    .from("context_presets")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id, name, content, scope, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Lỗi đổi tên" };
  }

  revalidatePath("/settings/presets");
  return { ok: true, preset: data as Preset };
}

const updateContentSchema = z.object({
  id: z.string().uuid(),
  content: contentSchema,
});

export async function updatePresetContent(input: {
  id: string;
  content: string;
}): Promise<PresetActionResult> {
  const parsed = updateContentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { data, error } = await supabase
    .from("context_presets")
    .update({ content: parsed.data.content })
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id, name, content, scope, updated_at")
    .single();

  if (error || !data) {
    return { ok: false, message: error?.message ?? "Lỗi cập nhật nội dung" };
  }

  revalidatePath("/settings/presets");
  return { ok: true, preset: data as Preset };
}

export async function deletePreset(
  id: string,
): Promise<{ ok: boolean; message?: string }> {
  if (!id || !z.string().uuid().safeParse(id).success) {
    return { ok: false, message: "ID không hợp lệ" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { error } = await supabase
    .from("context_presets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/settings/presets");
  return { ok: true };
}
