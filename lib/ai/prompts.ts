import "server-only";

export const SYSTEM_PROMPT = `Bạn là chuyên gia Facebook Ads, Performance Marketing và Content Marketing với 10+ năm kinh nghiệm. Nhiệm vụ của bạn là đọc content quảng cáo Facebook, nhận diện các thành phần quan trọng, chấm điểm chất lượng content, cảnh báo rủi ro chính sách Meta, và đề xuất cải thiện.

Quy tắc bắt buộc:
1. Bạn KHÔNG cam kết hiệu quả quảng cáo thực tế. Bạn KHÔNG được nói CTR chắc chắn đạt bao nhiêu. Chỉ đưa ra CTR Potential dạng MỨC ĐỘ ("Trung bình", "Khá", "Cao") hoặc KHOẢNG ("1.6% – 3.6%"). Luôn kèm note rằng đây là ước tính dựa trên chất lượng content, chưa bao gồm creative, target, ngân sách, lịch sử tài khoản, landing page.
2. Không bịa số liệu, case study, social proof. Nếu thấy thiếu, hãy GỢI Ý người dùng bổ sung số liệu thật.
3. Chấm điểm theo 9 tiêu chí với key cố định:
   - hook (Hook, weight 15): có thu hút trong 3 giây đầu, có nêu vấn đề/lợi ích cụ thể
   - insight (Insight, weight 15): có chạm đúng nỗi đau/mong muốn, hiểu đối tượng
   - benefit (Lợi ích, weight 15): rõ, cụ thể, gắn với kết quả mong muốn
   - offer (Offer, weight 10): hấp dẫn, có giá trị/ưu đãi/điều kiện
   - cta (CTA, weight 10): rõ hành động, gắn với mục tiêu quảng cáo
   - clarity (Độ rõ ràng, weight 10): dễ hiểu, một thông điệp chính
   - persuasion (Thuyết phục, weight 10): có bằng chứng/số liệu/review
   - facebook_fit (Phù hợp Facebook Ads, weight 10): phù hợp định dạng feed, dễ đọc mobile
   - policy_safety (Rủi ro chính sách, weight 5): điểm CAO = an toàn (ít rủi ro). Phát hiện cam kết tuyệt đối, từ "100%/đảm bảo/khỏi hẳn", nhắm trực tiếp đặc điểm cá nhân, claim sức khỏe sai → trừ điểm.
4. Mỗi tiêu chí chấm 0-100. Giải thích NGẮN GỌN (1-2 câu).
5. overall_score là TỔNG ĐIỂM CÓ TRỌNG SỐ: sum(score_i * weight_i) / 100. Tính chính xác.
6. score_label theo overall_score: 85+ "Rất tốt", 75-84 "Tốt", 60-74 "Khá", 40-59 "Trung bình", <40 "Cần tối ưu".
7. Đưa 3-5 điểm mạnh ngắn gọn, 3-5 điểm yếu, 3-5 đề xuất cụ thể.
8. Trả về DUY NHẤT một JSON object hợp lệ qua tool 'submit_analysis'. KHÔNG thêm markdown, prose, hay text ngoài tool call.

Ngôn ngữ trả về: Tiếng Việt tự nhiên, ngắn gọn.`;

export const DETECT_AND_SCORE_TOOL = {
  name: "submit_analysis",
  description:
    "Nộp kết quả phân tích content quảng cáo Facebook. Bao gồm phần nhận diện thành phần và phần chấm điểm chi tiết.",
  input_schema: {
    type: "object" as const,
    required: ["detection", "score"],
    properties: {
      detection: {
        type: "object",
        required: [
          "platform",
          "objective",
          "audience",
          "hook",
          "offer",
          "cta",
          "tone_of_voice",
          "content_type",
          "policy_risk_level",
          "policy_risk_summary",
        ],
        properties: {
          platform: { type: "string", description: "Luôn là 'Facebook Ads'" },
          objective: {
            type: "string",
            description:
              "Mục tiêu quảng cáo dự đoán (Tăng nhận diện / Tin nhắn / Thu lead / Chuyển đổi / Traffic / Tăng tương tác / Remarketing)",
          },
          audience: {
            type: "string",
            description: "Đối tượng mục tiêu mô tả ngắn gọn",
          },
          hook: { type: "string", description: "Câu hook chính trong content" },
          offer: { type: "string", description: "Offer / lợi ích chính" },
          cta: { type: "string", description: "Lời kêu gọi hành động" },
          tone_of_voice: { type: "string" },
          content_type: { type: "string" },
          policy_risk_level: { type: "string", enum: ["low", "medium", "high"] },
          policy_risk_summary: { type: "string" },
        },
      },
      score: {
        type: "object",
        required: [
          "overall_score",
          "score_label",
          "ctr_potential",
          "criteria_scores",
          "strengths",
          "weaknesses",
          "policy_risks",
          "recommendations",
          "summary",
        ],
        properties: {
          overall_score: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            description: "Tổng điểm có trọng số (0-100)",
          },
          score_label: { type: "string" },
          ctr_potential: {
            type: "object",
            required: ["level", "range", "note"],
            properties: {
              level: {
                type: "string",
                description: "VD: 'Trung bình - Khá', 'Khá', 'Cao'",
              },
              range: {
                type: "string",
                description: "VD: '1.6% - 3.6%'",
              },
              note: {
                type: "string",
                description: "Disclaimer giải thích đây là ước tính",
              },
            },
          },
          criteria_scores: {
            type: "array",
            minItems: 9,
            maxItems: 9,
            description:
              "Đúng 9 phần tử theo thứ tự: hook, insight, benefit, offer, cta, clarity, persuasion, facebook_fit, policy_safety",
            items: {
              type: "object",
              required: ["key", "score", "explanation"],
              properties: {
                key: {
                  type: "string",
                  enum: [
                    "hook",
                    "insight",
                    "benefit",
                    "offer",
                    "cta",
                    "clarity",
                    "persuasion",
                    "facebook_fit",
                    "policy_safety",
                  ],
                },
                score: { type: "integer", minimum: 0, maximum: 100 },
                explanation: {
                  type: "string",
                  description: "1-2 câu giải thích vì sao chấm điểm này",
                },
              },
            },
          },
          strengths: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: { type: "string" },
          },
          weaknesses: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: { type: "string" },
          },
          policy_risks: {
            type: "array",
            maxItems: 5,
            items: {
              type: "object",
              required: ["level", "issue", "suggestion"],
              properties: {
                level: { type: "string", enum: ["low", "medium", "high"] },
                issue: { type: "string" },
                suggestion: { type: "string" },
              },
            },
          },
          recommendations: {
            type: "array",
            minItems: 1,
            maxItems: 8,
            items: { type: "string" },
          },
          summary: {
            type: "string",
            description: "1-2 câu tóm tắt tổng quan content",
          },
        },
      },
    },
  },
};

export type AnalysisInput = {
  content: string;
  objective?: string;
  audience?: string;
  industry?: string;
  landing_page?: string;
  notes?: string;
};

export const REWRITE_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

Khi viết lại content, BẠN CŨNG LÀ một copywriter Facebook Ads xuất sắc:
- Giữ thông điệp cốt lõi của content gốc.
- Tuân thủ giọng văn / độ dài / mức độ bán hàng / mục tiêu tối ưu mà user yêu cầu.
- Không bịa số liệu, không cam kết tuyệt đối, không vi phạm chính sách Meta.
- Bản viết lại PHẢI khác bản gốc đáng kể (không chỉ đổi vài từ).
- Sau khi viết lại, chấm điểm bản mới đầy đủ 9 tiêu chí như cũ.
- Liệt kê 3-6 cải thiện cụ thể (ngắn gọn) mà bản mới có so với bản cũ.`;

export const REWRITE_TOOL = {
  name: "submit_rewrite",
  description:
    "Nộp bản viết lại content quảng cáo, kèm phân tích nhận diện và điểm chi tiết của bản mới.",
  input_schema: {
    type: "object" as const,
    required: ["rewritten_content", "improvements", "detection", "score"],
    properties: {
      rewritten_content: {
        type: "string",
        description: "Bản content viết lại tối ưu (giữ nguyên tiếng Việt)",
      },
      improvements: {
        type: "array",
        minItems: 1,
        maxItems: 8,
        description: "Liệt kê 3-6 cải thiện cụ thể của bản mới so với bản gốc",
        items: { type: "string" },
      },
      detection: DETECT_AND_SCORE_TOOL.input_schema.properties.detection,
      score: DETECT_AND_SCORE_TOOL.input_schema.properties.score,
    },
  },
};

export type RewriteInput = {
  original_content: string;
  options: {
    tone: string;
    length: string;
    sales_level: string;
    optimization_goal: string;
  };
  context?: {
    objective?: string | null;
    audience?: string | null;
    industry?: string | null;
    landing_page?: string | null;
  };
  weaknesses?: string[];
  extra_context?: string | null;
};

export function buildRewriteMessage(input: RewriteInput): string {
  const { options, context, weaknesses, extra_context } = input;
  const ctx: string[] = [];
  if (context?.objective) ctx.push(`- Mục tiêu quảng cáo: ${context.objective}`);
  if (context?.audience) ctx.push(`- Đối tượng mục tiêu: ${context.audience}`);
  if (context?.industry) ctx.push(`- Ngành hàng: ${context.industry}`);
  if (context?.landing_page) ctx.push(`- Landing page: ${context.landing_page}`);

  const weaknessList = weaknesses?.length
    ? `\n\nNhững điểm cần cải thiện (từ lần chấm trước):\n- ${weaknesses.join("\n- ")}`
    : "";

  const extra = extra_context?.trim()
    ? `\n\nThông tin sản phẩm / offer / bằng chứng do user cung cấp (ƯU TIÊN dùng để bản viết lại cụ thể, có số liệu, đúng tone brand):\n${extra_context.trim()}`
    : "";

  return `Viết lại content quảng cáo Facebook sau theo yêu cầu rồi gọi tool submit_rewrite.

Tuỳ chọn viết lại:
- Giọng văn: ${options.tone}
- Độ dài: ${options.length}
- Mức độ bán hàng: ${options.sales_level}
- Mục tiêu tối ưu: ${options.optimization_goal}

${ctx.length ? "Bối cảnh:\n" + ctx.join("\n") + "\n" : ""}${weaknessList}${extra}

Content gốc:
"""
${input.original_content}
"""`;
}

export function buildUserMessage(input: AnalysisInput): string {
  const optional: string[] = [];
  if (input.objective) optional.push(`- Mục tiêu quảng cáo: ${input.objective}`);
  if (input.audience) optional.push(`- Đối tượng mục tiêu: ${input.audience}`);
  if (input.industry) optional.push(`- Ngành hàng: ${input.industry}`);
  if (input.landing_page)
    optional.push(`- Landing page: ${input.landing_page}`);
  if (input.notes) optional.push(`- Ghi chú: ${input.notes}`);

  return `Phân tích content quảng cáo Facebook sau và gọi tool submit_analysis.

${optional.length ? "Thông tin bổ sung:\n" + optional.join("\n") + "\n\n" : ""}Content:
"""
${input.content}
"""`;
}
