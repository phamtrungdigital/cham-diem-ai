"use client";

import { useActionState } from "react";
import Field from "./Field";
import SubmitButton from "./SubmitButton";
import { signIn, type AuthState } from "@/lib/auth/actions";

const initial: AuthState = { ok: false };

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signIn, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
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
        autoComplete="current-password"
        placeholder="••••••••"
        required
      />
      {state.message && !state.ok && (
        <p className="rounded-md border border-[#fee2e2] bg-[#fef2f2] px-3 py-2 text-xs text-[#b91c1c]">
          {state.message}
        </p>
      )}
      <SubmitButton label="Đăng nhập" />
    </form>
  );
}
