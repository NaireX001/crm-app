"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const contact_id = String(formData.get("contact_id") ?? "") || null;
  const company_id = String(formData.get("company_id") ?? "") || null;
  const stage_id = String(formData.get("stage_id") ?? "");
  const value = Number(formData.get("value") ?? 0) || 0;
  const close_date = String(formData.get("close_date") ?? "") || null;

  const { error } = await supabase.from("deals").insert({
    name,
    contact_id,
    company_id,
    stage_id,
    value,
    close_date,
    owner_id: user.id,
  });

  if (error) {
    redirect(`/deals/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  redirect("/deals");
}

/**
 * Called directly from the Kanban board client component (not a <form>),
 * so it takes plain arguments rather than FormData.
 */
export async function updateDealStage(dealId: string, stageId: string) {
  const supabase = await createClient();
  await supabase.from("deals").update({ stage_id: stageId }).eq("id", dealId);
  revalidatePath("/deals");
  revalidatePath("/dashboard");
}

export async function deleteDeal(formData: FormData) {
  const supabase = await createClient();
  const dealId = String(formData.get("deal_id") ?? "");
  await supabase.from("deals").delete().eq("id", dealId);
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  redirect("/deals");
}
