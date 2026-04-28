"use client";

import { useActionState, useState } from "react";
import { startScoring, type ScoreState } from "@/lib/score/actions";

const initial: ScoreState = { ok: false };

const OBJECTIVES = [
  { value: "Tăng nhận diện", desc: "Phủ sóng thương hiệu / sản phẩm mới" },
  { value: "Tăng tương tác", desc: "Like, share, comment, video views" },
  { value: "Tin nhắn", desc: "Khách inbox để được tư vấn" },
  { value: "Thu lead", desc: "Form đăng ký / Lead Gen" },
  { value: "Traffic", desc: "Kéo người dùng tới website / landing page" },
  { value: "Chuyển đổi", desc: "Bán hàng trực tiếp / mua online" },
  { value: "Remarketing", desc: "Quảng cáo cho người đã tương tác" },
] as const;

const STEPS = [
  { n: 1, label: "Mục tiêu & ngành" },
  { n: 2, label: "Đối tượng" },
  { n: 3, label: "Sản phẩm & ưu đãi" },
  { n: 4, label: "Content & gửi" },
];

type State = {
  objective: string;
  industry: string;
  audience: string;
  product: string;
  usp: string;
  offer_details: string;
  proof: string;
  content: string;
  landing_page: string;
  notes: string;
};

const EMPTY_STATE: State = {
  objective: "",
  industry: "",
  audience: "",
  product: "",
  usp: "",
  offer_details: "",
  proof: "",
  content: "",
  landing_page: "",
  notes: "",
};

function buildExtraContext(s: State): string {
  const parts: string[] = [];
  if (s.product.trim()) parts.push(`Sản phẩm/dịch vụ: ${s.product.trim()}`);
  if (s.usp.trim()) parts.push(`USP / khác biệt: ${s.usp.trim()}`);
  if (s.offer_details.trim())
    parts.push(`Offer cụ thể: ${s.offer_details.trim()}`);
  if (s.proof.trim()) parts.push(`Bằng chứng / số liệu thật: ${s.proof.trim()}`);
  return parts.join("\n\n");
}

const ANALYZING_STEPS = [
  "Đang đọc nội dung",
  "Đang nhận diện Hook & Offer",
  "Đang phân tích CTA và tone of voice",
  "Đang chấm điểm theo 9 tiêu chí",
  "Đang kiểm tra rủi ro chính sách",
  "Đang tổng hợp kết quả",
];

function AnalyzingState() {
  return (
    <div className="rounded-[20px] border border-[var(--color-border)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f3ff]">
        <span className="block h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--color-text)]">
        AI đang phân tích content của bạn...
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Quá trình này thường mất 15-25 giây.
      </p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
        {ANALYZING_STEPS.map((s) => (
          <li key={s} className="flex items-center gap-2.5 text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GuidedScoreForm() {
  const [state, action, pending] = useActionState(startScoring, initial);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<State>(EMPTY_STATE);

  if (pending) return <AnalyzingState />;

  const update = (k: keyof State) => (v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canNext1 = !!form.objective;
  const canNext2 = form.audience.trim().length >= 5;
  // step 3 is fully optional
  const canSubmit =
    form.content.trim().length >= 20 && form.content.trim().length <= 5000;

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <ol className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s.n} className="flex flex-1 items-center gap-1.5">
            <div
              className={`flex h-1.5 flex-1 rounded-full transition-colors ${
                step >= s.n
                  ? "bg-[var(--color-primary)]"
                  : "bg-[var(--color-border)]"
              }`}
            />
            {i === STEPS.length - 1 && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Bước {step}/4
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="-mt-2 text-sm font-medium text-[var(--color-text)]">
        {STEPS[step - 1].label}
      </p>

      <form action={action} className="space-y-5">
        {/* Hidden inputs holding all values; form posts everything regardless of step */}
        <input type="hidden" name="objective" value={form.objective} />
        <input type="hidden" name="industry" value={form.industry} />
        <input type="hidden" name="audience" value={form.audience} />
        <input type="hidden" name="landing_page" value={form.landing_page} />
        <input type="hidden" name="notes" value={form.notes} />
        <input
          type="hidden"
          name="extra_context"
          value={buildExtraContext(form)}
        />

        {step === 1 && (
          <>
            <Card title="Bạn đang chạy mục tiêu quảng cáo nào?" required>
              <div className="grid gap-2 sm:grid-cols-2">
                {OBJECTIVES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => update("objective")(o.value)}
                    className={`flex items-start gap-3 rounded-[12px] border p-3 text-left transition-colors ${
                      form.objective === o.value
                        ? "border-[var(--color-primary)] bg-[#e8f3ff]"
                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        form.objective === o.value
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      {form.objective === o.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-[var(--color-text)]">
                        {o.value}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                        {o.desc}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Ngành hàng / lĩnh vực" hint="Tuỳ chọn">
              <Input
                value={form.industry}
                onChange={update("industry")}
                placeholder="Ví dụ: giáo dục, nha khoa, spa, phần mềm, bất động sản..."
              />
            </Card>
          </>
        )}

        {step === 2 && (
          <Card
            title="Đối tượng mục tiêu"
            required
            hint="Mô tả càng cụ thể, AI chấm càng chính xác"
          >
            <Textarea
              value={form.audience}
              onChange={update("audience")}
              rows={6}
              max={500}
              placeholder={`Mẹo viết tốt:
- Họ là ai? (vd: chủ shop online, phụ huynh có con lớp 9)
- Đặc điểm: tuổi, giới tính, thu nhập, vị trí
- Nỗi đau hoặc mong muốn lớn nhất
- Họ đang tìm kiếm/lo lắng gì khi gặp content này`}
            />
          </Card>
        )}

        {step === 3 && (
          <>
            <Card
              title="Sản phẩm / dịch vụ"
              hint="Càng cụ thể, AI viết và chấm càng sát thực tế"
            >
              <Textarea
                value={form.product}
                onChange={update("product")}
                rows={3}
                max={500}
                placeholder="Ví dụ: Khoá học IELTS 6.5+ cho người đi làm, học tối 2 buổi/tuần"
              />
            </Card>
            <Card title="USP / khác biệt với đối thủ" hint="Tuỳ chọn">
              <Textarea
                value={form.usp}
                onChange={update("usp")}
                rows={2}
                max={400}
                placeholder="Ví dụ: cam kết hoàn 100% học phí nếu không đạt band đã đăng ký"
              />
            </Card>
            <Card title="Offer cụ thể trong campaign này" hint="Tuỳ chọn">
              <Textarea
                value={form.offer_details}
                onChange={update("offer_details")}
                rows={2}
                max={400}
                placeholder="Ví dụ: Giảm 40% trong 7 ngày, học phí từ 4.9tr, tặng 4 buổi 1-1"
              />
            </Card>
            <Card
              title="Bằng chứng / số liệu thật có sẵn"
              hint="AI sẽ KHÔNG bịa số — anh đưa số nào AI dùng số đó"
            >
              <Textarea
                value={form.proof}
                onChange={update("proof")}
                rows={3}
                max={600}
                placeholder={`Ví dụ:
- 1.200 học viên đậu IELTS 7.0+ trong 2024
- Đối tác British Council, đã hợp tác 5 năm
- Review 4.9/5 trên Google Maps`}
              />
            </Card>
          </>
        )}

        {step === 4 && (
          <>
            <Card
              title="Dán content quảng cáo của bạn"
              required
              hint="20-5000 ký tự"
            >
              <Textarea
                name="content"
                value={form.content}
                onChange={update("content")}
                rows={9}
                max={5000}
                placeholder="Dán caption, headline, script video hoặc nội dung quảng cáo Facebook vào đây..."
              />
            </Card>
            <Card title="Link landing page" hint="Tuỳ chọn">
              <Input
                value={form.landing_page}
                onChange={update("landing_page")}
                placeholder="https://yourwebsite.com/landing-page"
                type="url"
              />
            </Card>
            <Card title="Ghi chú thêm cho AI" hint="Tuỳ chọn">
              <Textarea
                value={form.notes}
                onChange={update("notes")}
                rows={2}
                max={500}
                placeholder="Ví dụ: đây là creative cho audience cũ, cần giữ tone vui vẻ..."
              />
            </Card>
          </>
        )}

        {state.message && !state.ok && (
          <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]/40"
            >
              ← Quay lại
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={
                (step === 1 && !canNext1) || (step === 2 && !canNext2)
              }
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3 | 4)}
              className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp tục →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-[var(--color-primary)] px-6 text-sm font-medium text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 1l2 5 5 1-3.5 3.5 1 5L8 12l-4.5 3.5 1-5L1 7l5-1L8 1z"
                  fill="currentColor"
                />
              </svg>
              AI đọc & chấm điểm
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Card({
  title,
  hint,
  required,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {title}
          {required && <span className="ml-1 text-[var(--color-error)]">*</span>}
        </p>
        {hint && (
          <span className="text-xs text-[var(--color-text-muted)]">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block h-11 w-full rounded-[12px] border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows,
  max,
  placeholder,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
  max: number;
  placeholder?: string;
  name?: string;
}) {
  const len = value.length;
  return (
    <div>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-[12px] border border-[var(--color-border)] bg-white p-3.5 text-sm leading-relaxed text-[var(--color-text)] placeholder:whitespace-pre-line placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      <p
        className={`mt-1 text-right text-[11px] ${
          len > max
            ? "text-[var(--color-error)]"
            : "text-[var(--color-text-muted)]"
        }`}
      >
        {len}/{max}
      </p>
    </div>
  );
}
