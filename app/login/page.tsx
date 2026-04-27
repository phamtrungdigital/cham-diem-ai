import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Đăng nhập — Facebook Ads Content Score" };

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { next } = await searchParams;

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Tiếp tục chấm điểm content và tối ưu Facebook Ads."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
      <div className="mt-4 text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          Quên mật khẩu?
        </Link>
      </div>
    </AuthShell>
  );
}
