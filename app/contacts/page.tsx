import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/server";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const q = searchParams.q?.trim();

  let query = supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, tags, companies(id, name)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: contacts } = await query;

  return (
    <AppShell active="/contacts">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link href="/contacts/new">
          <Button>New contact</Button>
        </Link>
      </div>

      <form className="mb-6 max-w-sm">
        <Input
          type="search"
          name="q"
          placeholder="Search by name or email…"
          defaultValue={q}
        />
      </form>

      <div className="space-y-2">
        {(contacts ?? []).map((c) => (
          <Link key={c.id} href={`/contacts/${c.id}`}>
            <Card className="flex flex-wrap items-center justify-between gap-2 transition-colors hover:border-gray-400">
              <div>
                <p className="font-medium">
                  {c.first_name} {c.last_name ?? ""}
                </p>
                <p className="text-sm text-gray-600">
                  {c.email ?? "No email"}
                  {c.phone ? ` · ${c.phone}` : ""}
                  {c.companies ? ` · ${(c.companies as any).name}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(c.tags ?? []).map((tag: string) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
        {(contacts ?? []).length === 0 && (
          <EmptyState
            text={
              q
                ? `No contacts match "${q}".`
                : "No contacts yet. Create your first one."
            }
          />
        )}
      </div>
    </AppShell>
  );
}
