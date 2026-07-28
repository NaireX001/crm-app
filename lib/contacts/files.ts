"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "contact-files";

export async function uploadContactFile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const contactId = String(formData.get("contact_id") ?? "");
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent("Choose a file first.")}`
    );
  }

  const path = `${contactId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file);

  if (uploadError) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(
        `Upload failed: ${uploadError.message}. Make sure the "${BUCKET}" storage bucket exists in Supabase.`
      )}`
    );
  }

  const { error: dbError } = await supabase.from("contact_files").insert({
    contact_id: contactId,
    storage_path: path,
    file_name: file.name,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  if (dbError) {
    redirect(
      `/contacts/${contactId}?error=${encodeURIComponent(dbError.message)}`
    );
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}?message=File uploaded`);
}

export async function deleteContactFile(formData: FormData) {
  const supabase = await createClient();
  const contactId = String(formData.get("contact_id") ?? "");
  const fileId = String(formData.get("file_id") ?? "");
  const storagePath = String(formData.get("storage_path") ?? "");

  await supabase.storage.from(BUCKET).remove([storagePath]);
  await supabase.from("contact_files").delete().eq("id", fileId);

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
