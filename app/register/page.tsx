import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = { title: "Đăng ký — Facebook Ads Content Score" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Tạo tài khoản miễn phí"
      subtitle="Chấm điểm content Facebook Ads, tối ưu CTR và tiết kiệm ngân sách."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
