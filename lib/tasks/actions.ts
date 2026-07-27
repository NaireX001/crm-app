"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const due_date = String(formData.get("due_date") ?? "") || null;
  const contact_id = String(formData.get("contact_id") ?? "") || null;
  const deal_id = String(formData.get("deal_id") ?? "") || null;
  const redirectTo = String(formData.get("redirect_to") ?? "/tasks");

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    due_date,
    contact_id,
    deal_id,
    assigned_to: user.id,
  });

  if (error) {
    redirect(`${redirectTo}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(redirectTo);
  revalidatePath("/dashboard");
  redirect(redirectTo);
}

export async function toggleTaskStatus(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("task_id") ?? "");
  const currentStatus = String(formData.get("current_status") ?? "pending");
  const redirectTo = String(formData.get("redirect_to") ?? "/tasks");
  const nextStatus = currentStatus === "completed" ? "pending" : "completed";

  await supabase.from("tasks").update({ status: nextStatus }).eq("id", taskId);

  revalidatePath(redirectTo);
  revalidatePath("/dashboard");
  redirect(redirectTo);
}

export async function deleteTask(formData: FormData) {
  const supabase = await createClient();
  const taskId = String(formData.get("task_id") ?? "");
  const redirectTo = String(formData.get("redirect_to") ?? "/tasks");
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath(redirectTo);
  revalidatePath("/dashboard");
  redirect(redirectTo);
}
