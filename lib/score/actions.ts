"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAiCredentialsStatus } from "@/lib/ai/credentials";
import {
  detectAndScore,
  MissingApiKeyError,
  AiResponseError,
} from "@/lib/ai/client";
import { CRITERIA_DEFS, scoreLabelFor } from "@/lib/ai/schemas";

const startSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, "Content cần ít nhất 20 ký tự")
    .max(5000, "Content tối đa 5000 ký tự"),
  objective: z.string().trim().max(80).optional().or(z.literal("")),
  audience: z.string().trim().max(200).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  landing_page: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type ScoreState = { ok: boolean; message?: string; redirectTo?: string };

export async function startScoring(
  _prev: ScoreState,
  formData: FormData,
): Promise<ScoreState> {
  const parsed = startSchema.safeParse({
    content: formData.get("content"),
    objective: formData.get("objective") ?? "",
    audience: formData.get("audience") ?? "",
    industry: formData.get("industry") ?? "",
    landing_page: formData.get("landing_page") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const status = await getAiCredentialsStatus();
  const provider = status.defaultProvider;
  if (
    (provider === "anthropic" && !status.anthropic.hasKey) ||
    (provider === "openai" && !status.openai.hasKey)
  ) {
    return {
      ok: false,
      message:
        "Bạn chưa có API key cho provider mặc định. Vào Cài đặt để thêm key.",
    };
  }

  let analysis;
  try {
    analysis = await detectAndScore(provider, {
      content: parsed.data.content,
      objective: parsed.data.objective || undefined,
      audience: parsed.data.audience || undefined,
      industry: parsed.data.industry || undefined,
      landing_page: parsed.data.landing_page || undefined,
      notes: parsed.data.notes || undefined,
    });
  } catch (e) {
    if (e instanceof MissingApiKeyError) {
      return { ok: false, message: e.message };
    }
    if (e instanceof AiResponseError) {
      return {
        ok: false,
        message: "AI không trả về kết quả hợp lệ, vui lòng thử lại.",
      };
    }
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return { ok: false, message: `Lỗi gọi AI: ${msg}` };
  }

  const { detection, score } = analysis;
  const title = parsed.data.content.slice(0, 80).replace(/\s+/g, " ").trim();

  const { data: item, error: itemErr } = await supabase
    .from("content_items")
    .insert({
      user_id: user.id,
      title,
      platform: "Facebook Ads",
      objective: parsed.data.objective || null,
      audience: parsed.data.audience || null,
      industry: parsed.data.industry || null,
      landing_page: parsed.data.landing_page || null,
      notes: parsed.data.notes || null,
      status: "scored",
    })
    .select("id")
    .single();

  if (itemErr || !item) {
    return { ok: false, message: itemErr?.message ?? "Lỗi tạo content item" };
  }

  const { data: version, error: verErr } = await supabase
    .from("content_versions")
    .insert({
      content_item_id: item.id,
      version_number: 1,
      version_type: "original",
      body: parsed.data.content,
    })
    .select("id")
    .single();

  if (verErr || !version) {
    return { ok: false, message: verErr?.message ?? "Lỗi lưu phiên bản" };
  }

  await supabase.from("ai_recognitions").insert({
    content_item_id: item.id,
    version_id: version.id,
    platform: detection.platform,
    objective: detection.objective,
    audience: detection.audience,
    hook: detection.hook,
    offer: detection.offer,
    cta: detection.cta,
    tone_of_voice: detection.tone_of_voice,
    policy_risk_level: detection.policy_risk_level,
    policy_risk_summary: detection.policy_risk_summary,
    user_confirmed: false,
  });

  const overallScore = Math.round(score.overall_score);
  const label = scoreLabelFor(overallScore);

  const { data: result, error: resErr } = await supabase
    .from("score_results")
    .insert({
      content_item_id: item.id,
      version_id: version.id,
      overall_score: overallScore,
      score_label: label,
      ctr_potential_level: score.ctr_potential.level,
      ctr_potential_range: score.ctr_potential.range,
      ctr_potential_note: score.ctr_potential.note,
      summary: score.summary,
      strengths: score.strengths,
      weaknesses: score.weaknesses,
      recommendations: score.recommendations,
      policy_risks: score.policy_risks,
    })
    .select("id")
    .single();

  if (resErr || !result) {
    return { ok: false, message: resErr?.message ?? "Lỗi lưu kết quả" };
  }

  const criteriaRows = score.criteria_scores.map((c) => {
    const def = CRITERIA_DEFS.find((d) => d.key === c.key);
    return {
      score_result_id: result.id,
      criteria_key: c.key,
      criteria_name: def?.name ?? c.key,
      score: c.score,
      weight: def?.weight ?? 0,
      explanation: c.explanation,
    };
  });

  const { error: critErr } = await supabase
    .from("criteria_scores")
    .insert(criteriaRows);
  if (critErr) {
    return { ok: false, message: critErr.message };
  }

  revalidatePath("/dashboard");
  redirect(`/score/${item.id}/result`);
}
