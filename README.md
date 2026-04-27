# Facebook Ads Content Score

AI chấm điểm content quảng cáo Facebook trước khi chạy ads — dán content vào, AI tự đọc, chấm điểm theo 9 tiêu chí, cảnh báo rủi ro chính sách và viết lại bản tối ưu.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + design tokens theo `DESIGN.md` (Meta-style)
- **Supabase** — Postgres + Auth + Storage
- **Anthropic Claude** (primary) + **OpenAI** (fallback) cho AI scoring
- **Zod** cho schema validation

## Getting started

```bash
npm install
cp .env.example .env.local   # điền keys
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Cấu trúc dự kiến

```
app/
  (public)/        landing, demo, login, register, forgot-password
  (app)/           dashboard, score/*, library, history, reports, settings
  api/ai/          detect-content, score-content, rewrite-content, compare-versions
lib/
  ai/              anthropic, openai, prompts, schemas
  supabase/        client (browser), server (RSC), middleware
components/
  ui/              base UI primitives
  feature/         ScoreGauge, AIRecognitionPanel, VersionCompareCard, ...
```

## Quy ước

- **AI key chỉ ở server** (`/api/ai/*`), không bao giờ gọi từ client.
- **CTR Potential** trả về dạng khoảng (vd. `1.6% - 3.6%`) hoặc mức (`Trung bình - Khá`), không bao giờ là số khẳng định.
- **9 tiêu chí chấm điểm:** Hook, Insight, Lợi ích, Offer, CTA, Độ rõ ràng, Thuyết phục, Phù hợp Facebook Ads, Rủi ro chính sách.
- UI tham chiếu `DESIGN.md` (getdesign meta) trước khi viết component.

## Trạng thái

🚧 Phase 0 — scaffold + design tokens + deps. Phase 1 (landing page) đang chuẩn bị.
