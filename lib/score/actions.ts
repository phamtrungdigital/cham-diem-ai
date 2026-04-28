"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAiCredentialsStatus } from "@/lib/ai/credentials";
import {
  detectAndScore,
  rewriteAndScore,
  MissingApiKeyError,
  AiResponseError,
} from "@/lib/ai/client";
import {
  CRITERIA_DEFS,
  scoreLabelFor,
  normalizeCriteriaScores,
  REWRITE_TONES,
  REWRITE_LENGTHS,
  REWRITE_SALES_LEVELS,
  REWRITE_GOALS,
} from "@/lib/ai/schemas";

const startSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, "Content cần ít nhất 20 ký tự")
    .max(5000, "Content tối đa 5000 ký tự"),
  objective: z.string().trim().max(80).optional().or(z.literal("")),
  audience: z.string().trim().max(500).optional().or(z.literal("")),
  industry: z.string().trim().max(80).optional().or(z.literal("")),
  landing_page: z.string().trim().max(500).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  extra_context: z.string().trim().max(3000).optional().or(z.literal("")),
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
    extra_context: formData.get("extra_context") ?? "",
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
      extra_context: parsed.data.extra_context || null,
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

  const normalized = normalizeCriteriaScores(score.criteria_scores);
  const criteriaRows = normalized.map((c) => {
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

const rewriteSchema = z.object({
  content_item_id: z.string().uuid(),
  tone: z.enum(REWRITE_TONES),
  length: z.enum(REWRITE_LENGTHS),
  sales_level: z.enum(REWRITE_SALES_LEVELS),
  optimization_goal: z.enum(REWRITE_GOALS),
  extra_context: z
    .string()
    .trim()
    .max(2000, "Thông tin bổ sung tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
});

export async function rewriteScore(
  _prev: ScoreState,
  formData: FormData,
): Promise<ScoreState> {
  const parsed = rewriteSchema.safeParse({
    content_item_id: formData.get("content_item_id"),
    tone: formData.get("tone"),
    length: formData.get("length"),
    sales_level: formData.get("sales_level"),
    optimization_goal: formData.get("optimization_goal"),
    extra_context: formData.get("extra_context") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, message: "Vui lòng chọn đầy đủ tuỳ chọn viết lại" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Bạn cần đăng nhập" };

  const { data: item, error: itemErr } = await supabase
    .from("content_items")
    .select("id, objective, audience, industry, landing_page, user_id")
    .eq("id", parsed.data.content_item_id)
    .maybeSingle();
  if (itemErr || !item) {
    return { ok: false, message: "Không tìm thấy content" };
  }

  const { data: latestVersion } = await supabase
    .from("content_versions")
    .select("id, version_number, body")
    .eq("content_item_id", item.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!latestVersion) {
    return { ok: false, message: "Không tìm thấy phiên bản gốc" };
  }

  const { data: latestScore } = await supabase
    .from("score_results")
    .select("weaknesses")
    .eq("content_item_id", item.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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

  let result;
  try {
    result = await rewriteAndScore(provider, {
      original_content: latestVersion.body,
      options: {
        tone: parsed.data.tone,
        length: parsed.data.length,
        sales_level: parsed.data.sales_level,
        optimization_goal: parsed.data.optimization_goal,
      },
      context: {
        objective: item.objective,
        audience: item.audience,
        industry: item.industry,
        landing_page: item.landing_page,
      },
      weaknesses: (latestScore?.weaknesses as string[] | null) ?? [],
      extra_context: parsed.data.extra_context || null,
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

  const nextVersionNumber = latestVersion.version_number + 1;

  const { data: newVersion, error: verErr } = await supabase
    .from("content_versions")
    .insert({
      content_item_id: item.id,
      version_number: nextVersionNumber,
      version_type: "ai_optimized",
      body: result.rewritten_content,
    })
    .select("id")
    .single();

  if (verErr || !newVersion) {
    return { ok: false, message: verErr?.message ?? "Lỗi lưu phiên bản mới" };
  }

  await supabase.from("ai_recognitions").insert({
    content_item_id: item.id,
    version_id: newVersion.id,
    platform: result.detection.platform,
    objective: result.detection.objective,
    audience: result.detection.audience,
    hook: result.detection.hook,
    offer: result.detection.offer,
    cta: result.detection.cta,
    tone_of_voice: result.detection.tone_of_voice,
    policy_risk_level: result.detection.policy_risk_level,
    policy_risk_summary: result.detection.policy_risk_summary,
    user_confirmed: false,
  });

  const overallScore = Math.round(result.score.overall_score);
  const label = scoreLabelFor(overallScore);

  const { data: scoreRow, error: scoreErr } = await supabase
    .from("score_results")
    .insert({
      content_item_id: item.id,
      version_id: newVersion.id,
      overall_score: overallScore,
      score_label: label,
      ctr_potential_level: result.score.ctr_potential.level,
      ctr_potential_range: result.score.ctr_potential.range,
      ctr_potential_note: result.score.ctr_potential.note,
      summary: result.score.summary,
      strengths: result.score.strengths,
      weaknesses: result.score.weaknesses,
      recommendations: result.score.recommendations,
      policy_risks: result.score.policy_risks,
    })
    .select("id")
    .single();

  if (scoreErr || !scoreRow) {
    return { ok: false, message: scoreErr?.message ?? "Lỗi lưu điểm bản mới" };
  }

  const normalizedRewrite = normalizeCriteriaScores(result.score.criteria_scores);
  const criteriaRows = normalizedRewrite.map((c) => {
    const def = CRITERIA_DEFS.find((d) => d.key === c.key);
    return {
      score_result_id: scoreRow.id,
      criteria_key: c.key,
      criteria_name: def?.name ?? c.key,
      score: c.score,
      weight: def?.weight ?? 0,
      explanation: c.explanation,
    };
  });

  await supabase.from("criteria_scores").insert(criteriaRows);

  await supabase
    .from("content_items")
    .update({ status: "optimized" })
    .eq("id", item.id);

  revalidatePath(`/score/${item.id}/rewrite`);
  revalidatePath(`/score/${item.id}/result`);
  revalidatePath("/library");
  revalidatePath("/dashboard");

  return { ok: true, message: "Đã tạo bản viết lại" };
}
