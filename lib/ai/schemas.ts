import { z } from "zod";

export const detectionSchema = z.object({
  platform: z.string().default("Facebook Ads"),
  objective: z.string(),
  audience: z.string(),
  hook: z.string(),
  offer: z.string(),
  cta: z.string(),
  tone_of_voice: z.string(),
  content_type: z.string().default("Bài quảng cáo"),
  policy_risk_level: z.enum(["low", "medium", "high"]).default("low"),
  policy_risk_summary: z.string(),
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

export const criteriaScoreSchema = z.object({
  key: z.enum([
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
  score: z.number().int().min(0).max(100),
  explanation: z.string(),
});

export const ctrPotentialSchema = z.object({
  level: z.string(),
  range: z.string(),
  note: z.string(),
});

export const policyRiskSchema = z.object({
  level: z.enum(["low", "medium", "high"]),
  issue: z.string(),
  suggestion: z.string(),
});

export const scoreResultSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  score_label: z.string(),
  ctr_potential: ctrPotentialSchema,
  criteria_scores: z.array(criteriaScoreSchema).length(9),
  strengths: z.array(z.string()).min(1).max(8),
  weaknesses: z.array(z.string()).min(1).max(8),
  policy_risks: z.array(policyRiskSchema).max(5),
  recommendations: z.array(z.string()).min(1).max(8),
  summary: z.string(),
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
  rewritten_content: z.string().min(20).max(8000),
  improvements: z.array(z.string()).min(1).max(8),
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
