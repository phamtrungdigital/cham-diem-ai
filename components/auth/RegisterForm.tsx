"use client";

import { useActionState } from "react";
import Field from "./Field";
import SubmitButton from "./SubmitButton";
import { signUp, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = { ok: false };

export default function RegisterForm() {
  const [state, action] = useActionState(signUp, initial);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Họ và tên"
        name="name"
        autoComplete="name"
        placeholder="Nguyễn Văn A"
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="ban@vidu.com"
        required
      />
      <Field
        label="Mật khẩu"
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
      <SubmitButton label="Tạo tài khoản miễn phí" />
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng và chính sách bảo
        mật.
      </p>
    </form>
  );
}
