import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Đặt lại mật khẩu" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      subtitle="Tạo mật khẩu mới cho tài khoản của bạn."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
