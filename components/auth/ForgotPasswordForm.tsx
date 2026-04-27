"use client";

import { useActionState } from "react";
import Field from "./Field";
import SubmitButton from "./SubmitButton";
import { requestPasswordReset, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = { ok: false };

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="ban@vidu.com"
        required
      />
      {state.message && (
        <p
          className={`rounded-md border px-3 py-2 text-xs ${
            state.ok
              ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]"
              : "border-[#fee2e2] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          {state.message}
        </p>
      )}
      <SubmitButton label="Gửi link khôi phục" />
    </form>
  );
}
