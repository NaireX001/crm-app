"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  bulkDeleteContacts,
  bulkTagContacts,
  bulkReassignContacts,
} from "@/lib/contacts/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

interface ContactRow {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  created_at: string;
  companies: { id: string; name: string } | null;
  lastActivityAt: string | null;
}

export function ContactsTable({
  contacts,
  currentParams,
  sort,
  dir,
  isAdmin,
  profiles,
}: {
  contacts: ContactRow[];
  currentParams: Record<string, string | undefined>;
  sort: string;
  dir: "asc" | "desc";
  isAdmin: boolean;
  profiles: { id: string; email: string; full_name: string | null }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");
  const [reassignTo, setReassignTo] = useState("");

  function toggleAll() {
    setSelected((prev) =>
      prev.size === contacts.length ? new Set() : new Set(contacts.map((c) => c.id))
    );
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulkDelete() {
    if (!confirm(`Delete ${selected.size} contact(s)? This can't be undone.`)) return;
    startTransition(async () => {
      await bulkDeleteContacts(Array.from(selected));
      setSelected(new Set());
      router.refresh();
    });
  }

  function runBulkTag() {
    if (!tagInput.trim()) return;
    startTransition(async () => {
      await bulkTagContacts(Array.from(selected), tagInput.trim());
      setTagInput("");
      setSelected(new Set());
      router.refresh();
    });
  }

  function runBulkReassign() {
    if (!reassignTo) return;
    startTransition(async () => {
      await bulkReassignContacts(Array.from(selected), reassignTo);
      setReassignTo("");
      setSelected(new Set());
      router.refresh();
    });
  }

  function sortLink(column: string) {
    const nextDir = sort === column && dir === "asc" ? "desc" : "asc";
    const params = new URLSearchParams();
    Object.entries(currentParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("sort", column);
    params.set("dir", nextDir);
    params.set("page", "1");
    return `/contacts?${params.toString()}`;
  }

  function SortIcon({ column }: { column: string }) {
    if (sort !== column)
      return <ArrowUpDown size={13} className="text-gray-300" />;
    return dir === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <span className="text-sm font-medium text-indigo-900">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="h-8 w-32 py-1 text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={runBulkTag}
              disabled={isPending}
            >
              Tag
            </Button>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Select
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                className="h-8 w-40 py-1 text-sm"
              >
                <option value="">Reassign to…</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="secondary"
                onClick={runBulkReassign}
                disabled={isPending}
              >
                Reassign
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="danger"
            onClick={runBulkDelete}
            disabled={isPending}
            className="ml-auto"
          >
            Delete
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === contacts.length && contacts.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-2 py-3 font-medium">
                <Link href={sortLink("first_name")} className="flex items-center gap-1">
                  Name <SortIcon column="first_name" />
                </Link>
              </th>
              <th className="px-2 py-3 font-medium">Phone</th>
              <th className="px-2 py-3 font-medium">
                <Link href={sortLink("email")} className="flex items-center gap-1">
                  Email <SortIcon column="email" />
                </Link>
              </th>
              <th className="px-2 py-3 font-medium">Company</th>
              <th className="px-2 py-3 font-medium">
                <Link href={sortLink("created_at")} className="flex items-center gap-1">
                  Created <SortIcon column="created_at" />
                </Link>
              </th>
              <th className="px-2 py-3 font-medium">Last activity</th>
              <th className="px-2 py-3 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                  />
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/contacts/${c.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {c.first_name} {c.last_name ?? ""}
                  </Link>
                </td>
                <td className="px-2 py-3 text-gray-600">{c.phone ?? "—"}</td>
                <td className="px-2 py-3 text-gray-600">{c.email ?? "—"}</td>
                <td className="px-2 py-3 text-gray-600">
                  {c.companies ? (
                    <Link href={`/companies/${c.companies.id}`} className="hover:underline">
                      {c.companies.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-gray-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-2 py-3 whitespace-nowrap text-gray-500">
                  {c.lastActivityAt
                    ? new Date(c.lastActivityAt).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No contacts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
