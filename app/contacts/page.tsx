import Link from "next/link";
import { X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { createClient } from "@/lib/supabase/server";
import { createSavedView, deleteSavedView } from "@/lib/views/actions";

const SORTABLE_COLUMNS = ["first_name", "email", "created_at"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface SearchParams {
  q?: string;
  tag?: string;
  company_id?: string;
  sort?: string;
  dir?: string;
  page?: string;
  pageSize?: string;
  view?: string;
  error?: string;
  message?: string;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  // Resolve effective filters — a saved view (Smart List), if selected,
  // supplies the filter/sort values.
  let effective = {
    q: searchParams.q ?? "",
    tag: searchParams.tag ?? "",
    company_id: searchParams.company_id ?? "",
    sort: searchParams.sort ?? "",
    dir: searchParams.dir ?? "",
  };

  if (searchParams.view) {
    const { data: view } = await supabase
      .from("saved_views")
      .select("filters")
      .eq("id", searchParams.view)
      .single();
    if (view?.filters) {
      effective = { ...effective, ...(view.filters as typeof effective) };
    }
  }

  const sort = SORTABLE_COLUMNS.includes(effective.sort)
    ? effective.sort
    : "created_at";
  const dir: "asc" | "desc" = effective.dir === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(Number(searchParams.pageSize))
    ? Number(searchParams.pageSize)
    : 20;

  let query = supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, tags, created_at, company_id, companies(id, name)", {
      count: "exact",
    });

  if (effective.q) {
    query = query.or(
      `first_name.ilike.%${effective.q}%,last_name.ilike.%${effective.q}%,email.ilike.%${effective.q}%`
    );
  }
  if (effective.tag) {
    query = query.contains("tags", [effective.tag]);
  }
  if (effective.company_id) {
    query = query.eq("company_id", effective.company_id);
  }

  query = query
    .order(sort, { ascending: dir === "asc" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const [{ data: contacts, count }, { data: companies }, { data: savedViews }] =
    await Promise.all([
      query,
      supabase.from("companies").select("id, name").order("name"),
      user
        ? supabase
            .from("saved_views")
            .select("id, name")
            .eq("entity_type", "contacts")
            .order("created_at")
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

  const contactIds = (contacts ?? []).map((c) => c.id);
  let lastActivityMap: Record<string, string> = {};
  if (contactIds.length > 0) {
    const { data: activities } = await supabase
      .from("activities")
      .select("contact_id, occurred_at")
      .in("contact_id", contactIds)
      .order("occurred_at", { ascending: false });
    (activities ?? []).forEach((a) => {
      if (a.contact_id && !lastActivityMap[a.contact_id]) {
        lastActivityMap[a.contact_id] = a.occurred_at;
      }
    });
  }

  let adminProfiles: { id: string; email: string; full_name: string | null }[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .order("email");
    adminProfiles = data ?? [];
  }

  const rows = (contacts ?? []).map((c: any) => ({
    ...c,
    lastActivityAt: lastActivityMap[c.id] ?? null,
  }));

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const hasActiveFilters = Boolean(
    effective.q || effective.tag || effective.company_id
  );

  return (
    <AppShell active="/contacts">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {count ?? 0} contacts
          </span>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts/import">
            <Button variant="secondary">Import</Button>
          </Link>
          <Link href="/contacts/new">
            <Button>+ Add contact</Button>
          </Link>
        </div>
      </div>

      {searchParams.message && (
        <p className="mb-4 max-w-lg rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      {/* Smart Lists */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/contacts"
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            !searchParams.view
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </Link>
        {(savedViews ?? []).map((v) => (
          <div key={v.id} className="flex items-center gap-1">
            <Link
              href={`/contacts?view=${v.id}`}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                searchParams.view === v.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {v.name}
            </Link>
            <form action={deleteSavedView}>
              <input type="hidden" name="view_id" value={v.id} />
              <input type="hidden" name="base_path" value="/contacts" />
              <button
                type="submit"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Delete this smart list"
              >
                <X size={12} />
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Filters */}
      <form
        method="get"
        action="/contacts"
        className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Search
          </label>
          <Input
            type="search"
            name="q"
            placeholder="Name or email…"
            defaultValue={effective.q}
          />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Tag
          </label>
          <Input
            type="text"
            name="tag"
            placeholder="e.g. lead"
            defaultValue={effective.tag}
          />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Company
          </label>
          <Select name="company_id" defaultValue={effective.company_id}>
            <option value="">All companies</option>
            {(companies ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[100px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Per page
          </label>
          <Select name="pageSize" defaultValue={String(pageSize)}>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Apply</Button>
      </form>

      {!searchParams.view && (
        <form
          action={createSavedView}
          className="mb-4 flex items-center gap-2"
        >
          <input type="hidden" name="base_path" value="/contacts" />
          <input type="hidden" name="q" value={effective.q} />
          <input type="hidden" name="tag" value={effective.tag} />
          <input type="hidden" name="company_id" value={effective.company_id} />
          <input type="hidden" name="sort" value={sort} />
          <input type="hidden" name="dir" value={dir} />
          {!hasActiveFilters && (
            <span className="text-xs text-gray-400">
              Tip: set filters above, then save them as a Smart List →
            </span>
          )}
          <Input
            name="name"
            placeholder="Name this Smart List…"
            className="h-8 w-56 text-sm"
          />
          <Button type="submit" variant="secondary" className="h-8 py-0 text-sm">
            Save as Smart List
          </Button>
        </form>
      )}

      <ContactsTable
        contacts={rows}
        currentParams={{
          q: searchParams.q,
          tag: searchParams.tag,
          company_id: searchParams.company_id,
          pageSize: searchParams.pageSize,
          view: searchParams.view,
        }}
        sort={sort}
        dir={dir}
        isAdmin={isAdmin}
        profiles={adminProfiles}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          {page <= 1 ? (
            <Button variant="secondary" disabled>
              Prev
            </Button>
          ) : (
            <Link
              href={`/contacts?${new URLSearchParams({
                ...effective,
                pageSize: String(pageSize),
                page: String(page - 1),
              } as Record<string, string>).toString()}`}
            >
              <Button variant="secondary">Prev</Button>
            </Link>
          )}
          {page >= totalPages ? (
            <Button variant="secondary" disabled>
              Next
            </Button>
          ) : (
            <Link
              href={`/contacts?${new URLSearchParams({
                ...effective,
                pageSize: String(pageSize),
                page: String(page + 1),
              } as Record<string, string>).toString()}`}
            >
              <Button variant="secondary">Next</Button>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
