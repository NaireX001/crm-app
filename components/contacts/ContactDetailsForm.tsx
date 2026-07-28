"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { updateContact } from "@/lib/contacts/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import type { Contact } from "@/lib/types/database.types";

export function ContactDetailsForm({
  contact,
  companies,
}: {
  contact: Contact;
  companies: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  const matches = (label: string) =>
    !search.trim() || label.toLowerCase().includes(search.trim().toLowerCase());

  return (
    <div className="rounded-md border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-900"
      >
        Contact
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4">
          <div className="relative mb-4">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Search fields…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>

          <form action={updateContact} className="flex flex-col gap-4">
            <input type="hidden" name="contact_id" value={contact.id} />

            <div
              className={cn(
                "grid grid-cols-2 gap-4",
                !matches("first name") && !matches("last name") && "hidden"
              )}
            >
              <div className={cn(!matches("first name") && "hidden")}>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={contact.first_name}
                />
              </div>
              <div className={cn(!matches("last name") && "hidden")}>
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={contact.last_name ?? ""}
                />
              </div>
            </div>

            <div className={cn(!matches("email") && "hidden")}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact.email ?? ""}
              />
            </div>

            <div className={cn(!matches("phone") && "hidden")}>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact.phone ?? ""}
              />
            </div>

            <div className={cn(!matches("company") && "hidden")}>
              <Label htmlFor="company_id">Company</Label>
              <Select
                id="company_id"
                name="company_id"
                defaultValue={contact.company_id ?? ""}
              >
                <option value="">— none —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className={cn(!matches("tags") && "hidden")}>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={(contact.tags ?? []).join(", ")}
              />
            </div>

            <div className={cn(!matches("notes") && "hidden")}>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={contact.notes ?? ""}
              />
            </div>

            <Button type="submit" className="self-start">
              Save changes
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
