"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createActivity(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = String(formData.get("type") ?? "note");
  const subject = String(formData.get("subject") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim() || null;
  const contact_id = String(formData.get("contact_id") ?? "") || null;
  const deal_id = String(formData.get("deal_id") ?? "") || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/dashboard");

  const { error } = await supabase.from("activities").insert({
    type,
    subject,
    body,
    contact_id,
    deal_id,
    owner_id: user.id,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  revalidatePath("/dashboard");
  redirect(redirectTo);
}
