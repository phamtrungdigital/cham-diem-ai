import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Bạn";
  const userEmail = user.email ?? "";

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
