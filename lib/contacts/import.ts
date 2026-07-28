"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/csv";

const HEADER_ALIASES: Record<string, string> = {
  first_name: "first_name",
  "first name": "first_name",
  firstname: "first_name",
  last_name: "last_name",
  "last name": "last_name",
  lastname: "last_name",
  email: "email",
  phone: "phone",
  "phone number": "phone",
  company: "company",
  company_name: "company",
  "business name": "company",
  business_name: "company",
  tags: "tags",
  notes: "notes",
};

function normalizeHeader(h: string): string | null {
  return HEADER_ALIASES[h.trim().toLowerCase()] ?? null;
}

export async function importContacts(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    redirect(`/contacts/import?error=${encodeURIComponent("Choose a CSV file first.")}`);
  }

  const text = await file.text();
  const allRows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ""));

  if (allRows.length < 2) {
    redirect(`/contacts/import?error=${encodeURIComponent("That CSV looks empty.")}`);
  }

  const columnMap: Record<string, number> = {};
  allRows[0].forEach((h, i) => {
    const canonical = normalizeHeader(h);
    if (canonical) columnMap[canonical] = i;
  });

  if (columnMap.first_name === undefined) {
    redirect(
      `/contacts/import?error=${encodeURIComponent(
        "CSV must include a 'first_name' (or 'First Name') column."
      )}`
    );
  }

  const dataRows = allRows.slice(1);
  const companyCache = new Map<string, string>();

  const { data: existingCompanies } = await supabase
    .from("companies")
    .select("id, name");
  (existingCompanies ?? []).forEach((c) => {
    companyCache.set(c.name.trim().toLowerCase(), c.id);
  });

  async function resolveCompanyId(name: string): Promise<string | null> {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const key = trimmed.toLowerCase();
    if (companyCache.has(key)) return companyCache.get(key)!;
    const { data, error } = await supabase
      .from("companies")
      .insert({ name: trimmed, owner_id: user.id })
      .select("id")
      .single();
    if (error || !data) return null;
    companyCache.set(key, data.id);
    return data.id;
  }

  let imported = 0;
  let skipped = 0;

  for (const row of dataRows) {
    const first_name =
      columnMap.first_name !== undefined ? row[columnMap.first_name]?.trim() : "";
    if (!first_name) {
      skipped++;
      continue;
    }

    const last_name =
      columnMap.last_name !== undefined ? row[columnMap.last_name]?.trim() || null : null;
    const email =
      columnMap.email !== undefined ? row[columnMap.email]?.trim() || null : null;
    const phone =
      columnMap.phone !== undefined ? row[columnMap.phone]?.trim() || null : null;
    const companyName =
      columnMap.company !== undefined ? row[columnMap.company]?.trim() ?? "" : "";
    const tagsRaw =
      columnMap.tags !== undefined ? row[columnMap.tags]?.trim() ?? "" : "";
    const notes =
      columnMap.notes !== undefined ? row[columnMap.notes]?.trim() || null : null;

    const tags = tagsRaw
      ? tagsRaw
          .split(/[;|]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const company_id = companyName ? await resolveCompanyId(companyName) : null;

    const { error } = await supabase.from("contacts").insert({
      first_name,
      last_name,
      email,
      phone,
      company_id,
      tags,
      notes,
      owner_id: user.id,
    });

    if (error) skipped++;
    else imported++;
  }

  revalidatePath("/contacts");
  revalidatePath("/companies");
  redirect(
    `/contacts?message=${encodeURIComponent(
      `Imported ${imported} contact${imported === 1 ? "" : "s"}${
        skipped > 0 ? `, skipped ${skipped}` : ""
      }.`
    )}`
  );
}
