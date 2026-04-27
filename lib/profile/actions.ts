"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ROLES = [
  "freelancer",
  "agency",
  "business_owner",
  "marketing_team",
  "other",
] as const;

const USE_CASES = [
  "quick_score",
  "optimize_ads",
  "manage_team",
  "library",
  "other",
] as const;

const onboardingSchema = z.object({
  role: z.enum(ROLES),
  main_use_case: z.enum(USE_CASES),
});

export type OnboardingState = { ok: boolean; message?: string };

export async function saveOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    role: formData.get("role"),
    main_use_case: formData.get("main_use_case"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Vui lòng chọn đầy đủ các mục" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      main_use_case: parsed.data.main_use_case,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
