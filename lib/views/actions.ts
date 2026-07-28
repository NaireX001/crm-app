"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSavedView(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const basePath = String(formData.get("base_path") ?? "/contacts");

  if (!name) {
    redirect(`${basePath}?error=${encodeURIComponent("Name your view before saving.")}`);
  }

  const filters = {
    q: String(formData.get("q") ?? ""),
    tag: String(formData.get("tag") ?? ""),
    company_id: String(formData.get("company_id") ?? ""),
    sort: String(formData.get("sort") ?? ""),
    dir: String(formData.get("dir") ?? ""),
  };

  const { data, error } = await supabase
    .from("saved_views")
    .insert({
      owner_id: user.id,
      entity_type: "contacts",
      name,
      filters,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`${basePath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(basePath);
  redirect(`${basePath}?view=${data!.id}`);
}

export async function deleteSavedView(formData: FormData) {
  const supabase = await createClient();
  const viewId = String(formData.get("view_id") ?? "");
  const basePath = String(formData.get("base_path") ?? "/contacts");
  await supabase.from("saved_views").delete().eq("id", viewId);
  revalidatePath(basePath);
  redirect(basePath);
}
