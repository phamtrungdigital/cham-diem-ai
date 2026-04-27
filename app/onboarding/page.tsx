import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Chào mừng" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      <div className="px-6 py-6">
        <Logo />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[520px] rounded-[20px] border border-[var(--color-border)] bg-white p-8 shadow-[var(--shadow-card)]">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
