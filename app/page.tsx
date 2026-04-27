export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-10 shadow-[var(--shadow-card)]">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8f3ff] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
          Phase 0 · Scaffold ready
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--color-text)] md:text-4xl">
          Facebook Ads Content Score
        </h1>
        <p className="mb-6 text-base leading-relaxed text-[var(--color-text-muted)]">
          AI chấm điểm content quảng cáo Facebook, dự đoán CTR Potential, cảnh
          báo rủi ro chính sách và viết lại bản tối ưu.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--color-text-muted)]">
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
            Next.js 16
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
            Tailwind v4
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
            Supabase
          </span>
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1">
            Anthropic + OpenAI
          </span>
        </div>
      </div>
    </main>
  );
}
