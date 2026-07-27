"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("companies")
    .insert({ name, domain, industry, phone, address, notes, owner_id: user.id })
    .select("id")
    .single();

  if (error) {
    redirect(`/companies/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/companies");
  redirect(`/companies/${data!.id}`);
}

export async function updateCompany(formData: FormData) {
  const supabase = await createClient();
  const companyId = String(formData.get("company_id") ?? "");

  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { error } = await supabase
    .from("companies")
    .update({ name, domain, industry, phone, address, notes })
    .eq("id", companyId);

  if (error) {
    redirect(
      `/companies/${companyId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/companies/${companyId}`);
  revalidatePath("/companies");
  redirect(`/companies/${companyId}?message=Saved`);
}

export async function deleteCompany(formData: FormData) {
  const supabase = await createClient();
  const companyId = String(formData.get("company_id") ?? "");
  await supabase.from("companies").delete().eq("id", companyId);
  revalidatePath("/companies");
  redirect("/companies");
}
