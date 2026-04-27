"use client";

import { useActionState, useState } from "react";
import {
  saveOnboarding,
  type OnboardingState,
} from "@/lib/profile/actions";
import SubmitButton from "@/components/auth/SubmitButton";

const roles = [
  { value: "freelancer", label: "Freelancer", desc: "Làm việc tự do, dự án cá nhân" },
  { value: "agency", label: "Agency", desc: "Chạy ads cho nhiều khách hàng" },
  { value: "business_owner", label: "Chủ doanh nghiệp", desc: "Quản lý ads của business" },
  { value: "marketing_team", label: "Team marketing", desc: "Làm việc trong đội marketing" },
  { value: "other", label: "Khác", desc: "Vai trò khác không liệt kê ở trên" },
];

const useCases = [
  { value: "quick_score", label: "Chấm content nhanh", desc: "Test nhanh chất lượng trước khi chạy" },
  { value: "optimize_ads", label: "Tối ưu Facebook Ads", desc: "Cải thiện CTR, giảm CPM, tăng ROAS" },
  { value: "manage_team", label: "Quản lý content team", desc: "Theo dõi và đánh giá content team" },
  { value: "library", label: "Lưu thư viện content", desc: "Lưu trữ content tốt để tái sử dụng" },
  { value: "other", label: "Khác", desc: "Mục đích khác" },
];

const initial: OnboardingState = { ok: false };

export default function OnboardingForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<string>("");
  const [useCase, setUseCase] = useState<string>("");
  const [state, action] = useActionState(saveOnboarding, initial);

  const canNext = step === 1 ? !!role : !!useCase;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((s) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step >= s ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>

      <form action={action} className="space-y-5">
        <input type="hidden" name="role" value={role} />
        <input type="hidden" name="main_use_case" value={useCase} />

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Bạn là ai?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Giúp chúng tôi cá nhân hoá trải nghiệm phù hợp với bạn.
            </p>
            <div className="mt-4 space-y-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex w-full items-start gap-3 rounded-[12px] border p-4 text-left transition-colors ${
                    role === r.value
                      ? "border-[var(--color-primary)] bg-[#e8f3ff]"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      role === r.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {role === r.value && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-[var(--color-text)]">
                      {r.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                      {r.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Bạn chủ yếu dùng tool để làm gì?
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Chọn mục đích chính, có thể đổi lại trong cài đặt.
            </p>
            <div className="mt-4 space-y-2">
              {useCases.map((u) => (
                <button
                  key={u.value}
                  type="button"
                  onClick={() => setUseCase(u.value)}
                  className={`flex w-full items-start gap-3 rounded-[12px] border p-4 text-left transition-colors ${
                    useCase === u.value
                      ? "border-[var(--color-primary)] bg-[#e8f3ff]"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      useCase === u.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    {useCase === u.value && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-[var(--color-text)]">
                      {u.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                      {u.desc}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {state.message && !state.ok && (
          <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)]/40"
            >
              Quay lại
            </button>
          ) : (
            <span />
          )}
          {step === 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep(2)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-[12px] bg-[var(--color-primary)] px-5 text-sm font-medium text-white shadow-[0_2px_8px_rgba(24,119,242,0.25)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp tục
            </button>
          ) : (
            <div className="flex-1">
              <SubmitButton label="Hoàn tất" />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
