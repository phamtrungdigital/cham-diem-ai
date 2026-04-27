"use client";

import { useActionState } from "react";
import Field from "./Field";
import SubmitButton from "./SubmitButton";
import { resetPassword, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = { ok: false };

export default function ResetPasswordForm() {
  const [state, action] = useActionState(resetPassword, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Mật khẩu mới"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        required
        hint="Tối thiểu 8 ký tự"
      />
      {state.message && !state.ok && (
        <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {state.message}
        </p>
      )}
      <SubmitButton label="Cập nhật mật khẩu" />
    </form>
  );
}
