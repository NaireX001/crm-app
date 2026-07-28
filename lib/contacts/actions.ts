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

export async function updateContactCustomFields(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  const keys = formData.getAll("field_key") as string[];
  const values = formData.getAll("field_value") as string[];

  const custom_fields: Record<string, string> = {};
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    if (trimmedKey) custom_fields[trimmedKey] = values[i] ?? "";
  });

  const { error } = await supabase
    .from("contacts")
    .update({ custom_fields })
    .eq("id", contactId);

  if (error) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}?message=Custom fields saved`);
}

export async function updateContactOwner(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  const ownerId = String(formData.get("owner_id") ?? "") || null;

  const { error } = await supabase
    .from("contacts")
    .update({ owner_id: ownerId })
    .eq("id", contactId);

  if (error) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/contacts");
  redirect(`/contacts/${contactId}?message=Owner updated`);
}

export async function updateContactDnd(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");

  const dnd_email = formData.get("dnd_email") === "on";
  const dnd_sms = formData.get("dnd_sms") === "on";
  const dnd_call = formData.get("dnd_call") === "on";

  const { error } = await supabase
    .from("contacts")
    .update({ dnd_email, dnd_sms, dnd_call })
    .eq("id", contactId);

  if (error) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}?message=Do Not Disturb settings saved`);
}

export async function addFollower(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");

  if (!userId) {
    redirect(`/contacts/${contactId}?error=${encodeURIComponent("Choose someone to follow this contact.")}`);
  }

  const { error } = await supabase
    .from("contact_followers")
    .insert({ contact_id: contactId, user_id: userId });

  if (error) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function removeFollower(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");

  await supabase
    .from("contact_followers")
    .delete()
    .eq("contact_id", contactId)
    .eq("user_id", userId);

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

/**
 * Bulk actions below are called directly as functions from the client
 * component (ContactsTable), not via <form action>, so they take plain
 * arguments rather than FormData.
 */

export async function bulkDeleteContacts(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  await supabase.from("contacts").delete().in("id", ids);
  revalidatePath("/contacts");
}

export async function bulkTagContacts(ids: string[], tag: string) {
  if (ids.length === 0 || !tag.trim()) return;
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("contacts")
    .select("id, tags")
    .in("id", ids);

  if (!rows) return;

  await Promise.all(
    rows.map((r) => {
      const nextTags = Array.from(new Set([...(r.tags ?? []), tag.trim()]));
      return supabase.from("contacts").update({ tags: nextTags }).eq("id", r.id);
    })
  );

  revalidatePath("/contacts");
}

export async function bulkReassignContacts(ids: string[], newOwnerId: string) {
  if (ids.length === 0 || !newOwnerId) return;
  const supabase = await createClient();
  await supabase.from("contacts").update({ owner_id: newOwnerId }).in("id", ids);
  revalidatePath("/contacts");
}
