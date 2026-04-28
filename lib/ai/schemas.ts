import { z } from "zod";

const lower = z.preprocess(
  (v) => (typeof v === "string" ? v.toLowerCase().trim() : v),
  z.enum(["low", "medium", "high"]),
);

const intCoerced = z.preprocess((v) => {
  if (typeof v === "number") return Math.round(v);
  if (typeof v === "string") {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? Math.round(parsed) : v;
  }
  return v;
}, z.number().int().min(0).max(100));

const stringList = (max = 12) =>
  z.preprocess(
    (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()) : []),
    z.array(z.string().trim().min(1).max(400)).max(max),
  );

export const detectionSchema = z.object({
  platform: z.string().default("Facebook Ads"),
  objective: z.string().default("Chưa xác định"),
  audience: z.string().default("Chưa xác định"),
  hook: z.string().default(""),
  offer: z.string().default(""),
  cta: z.string().default(""),
  tone_of_voice: z.string().default(""),
  content_type: z.string().default("Bài quảng cáo"),
  policy_risk_level: lower.default("low"),
  policy_risk_summary: z.string().default("Không phát hiện rủi ro nghiêm trọng"),
});

export type Detection = z.infer<typeof detectionSchema>;

export const CRITERIA_DEFS = [
  { key: "hook", name: "Hook", weight: 15 },
  { key: "insight", name: "Insight", weight: 15 },
  { key: "benefit", name: "Lợi ích", weight: 15 },
  { key: "offer", name: "Offer", weight: 10 },
  { key: "cta", name: "CTA", weight: 10 },
  { key: "clarity", name: "Độ rõ ràng", weight: 10 },
  { key: "persuasion", name: "Thuyết phục", weight: 10 },
  { key: "facebook_fit", name: "Phù hợp Facebook Ads", weight: 10 },
  { key: "policy_safety", name: "Rủi ro chính sách", weight: 5 },
] as const;

const CRITERIA_KEYS = CRITERIA_DEFS.map((c) => c.key) as readonly string[];

export const criteriaScoreSchema = z.object({
  key: z.preprocess(
    (v) => (typeof v === "string" ? v.toLowerCase().trim() : v),
    z.enum([
      "hook",
      "insight",
      "benefit",
      "offer",
      "cta",
      "clarity",
      "persuasion",
      "facebook_fit",
      "policy_safety",
    ]),
  ),
  score: intCoerced,
  explanation: z.string().default(""),
});

export const ctrPotentialSchema = z.object({
  level: z.string().default("Trung bình"),
  range: z.string().default("Ước tính dựa trên chất lượng nội dung"),
  note: z
    .string()
    .default(
      "Ước tính dựa trên chất lượng nội dung; chưa bao gồm creative, target, ngân sách, lịch sử tài khoản và landing page.",
    ),
});

export const policyRiskSchema = z.object({
  level: lower.default("low"),
  issue: z.string().default(""),
  suggestion: z.string().default(""),
});

export const scoreResultSchema = z.object({
  overall_score: intCoerced,
  score_label: z.string().optional().default(""),
  ctr_potential: ctrPotentialSchema,
  // Allow 1-12 criteria — server fills missing keys with neutral defaults.
  criteria_scores: z.array(criteriaScoreSchema).min(1).max(12),
  strengths: stringList(12),
  weaknesses: stringList(12),
  policy_risks: z.array(policyRiskSchema).max(8).optional().default([]),
  recommendations: stringList(12),
  summary: z.string().optional().default(""),
});

export type ScoreResult = z.infer<typeof scoreResultSchema>;

export const detectAndScoreSchema = z.object({
  detection: detectionSchema,
  score: scoreResultSchema,
});

export type DetectAndScore = z.infer<typeof detectAndScoreSchema>;

export const REWRITE_TONES = [
  "Chuyên nghiệp",
  "Gần gũi",
  "Cảm xúc",
  "Trực diện",
  "Cao cấp",
  "Tư vấn",
  "Mạnh về chuyển đổi",
] as const;

export const REWRITE_LENGTHS = ["Ngắn", "Trung bình", "Dài"] as const;

export const REWRITE_SALES_LEVELS = ["Nhẹ", "Vừa", "Mạnh"] as const;

export const REWRITE_GOALS = [
  "Tăng CTR",
  "Tăng tin nhắn",
  "Tăng lead",
  "Giảm rủi ro chính sách",
  "Làm rõ offer",
  "Làm mạnh CTA",
  "Thêm bằng chứng thuyết phục",
] as const;

export const rewriteOptionsSchema = z.object({
  tone: z.enum(REWRITE_TONES),
  length: z.enum(REWRITE_LENGTHS),
  sales_level: z.enum(REWRITE_SALES_LEVELS),
  optimization_goal: z.enum(REWRITE_GOALS),
});

export type RewriteOptions = z.infer<typeof rewriteOptionsSchema>;

export const rewriteAndScoreSchema = z.object({
  rewritten_content: z.string().min(10).max(8000),
  improvements: stringList(12),
  detection: detectionSchema,
  score: scoreResultSchema,
});

export type RewriteAndScore = z.infer<typeof rewriteAndScoreSchema>;

export function scoreLabelFor(score: number): string {
  if (score >= 85) return "Rất tốt";
  if (score >= 75) return "Tốt";
  if (score >= 60) return "Khá";
  if (score >= 40) return "Trung bình";
  return "Cần tối ưu";
}

// Fill missing criteria keys with neutral defaults so we always have all 9 to display.
export function normalizeCriteriaScores(
  raw: Array<{ key: string; score: number; explanation: string }>,
): Array<{ key: string; score: number; explanation: string }> {
  const byKey = new Map<string, { key: string; score: number; explanation: string }>();
  for (const c of raw) {
    if (CRITERIA_KEYS.includes(c.key)) byKey.set(c.key, c);
  }
  return CRITERIA_DEFS.map(
    (def) =>
      byKey.get(def.key) ?? {
        key: def.key,
        score: 60,
        explanation: "AI không đánh giá tiêu chí này — điểm tham khảo trung bình.",
      },
  );
}
