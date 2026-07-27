"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseTags(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const company_id = String(formData.get("company_id") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const tags = parseTags(formData.get("tags"));

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      first_name,
      last_name,
      email,
      phone,
      company_id,
      notes,
      tags,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/contacts/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/contacts");
  redirect(`/contacts/${data!.id}`);
}

export async function updateContact(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");

  const first_name = String(formData.get("first_name") ?? "").trim();
  const last_name = String(formData.get("last_name") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const company_id = String(formData.get("company_id") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const tags = parseTags(formData.get("tags"));

  const { error } = await supabase
    .from("contacts")
    .update({ first_name, last_name, email, phone, company_id, notes, tags })
    .eq("id", contactId);

  if (error) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  redirect(`/contacts/${contactId}?message=Saved`);
}

export async function deleteContact(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  await supabase.from("contacts").delete().eq("id", contactId);
  revalidatePath("/contacts");
  redirect("/contacts");
}
