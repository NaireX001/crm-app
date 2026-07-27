import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/server";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createClient();
  const q = searchParams.q?.trim();

  let query = supabase
    .from("companies")
    .select("id, name, domain, industry")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: companies } = await query;

  return (
    <AppShell active="/companies">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Link href="/companies/new">
          <Button>New company</Button>
        </Link>
      </div>

      <form className="mb-6 max-w-sm">
        <Input type="search" name="q" placeholder="Search by name…" defaultValue={q} />
      </form>

      <div className="space-y-2">
        {(companies ?? []).map((c) => (
          <Link key={c.id} href={`/companies/${c.id}`}>
            <Card className="transition-colors hover:border-gray-400">
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-600">
                {c.industry ?? "No industry set"}
                {c.domain ? ` · ${c.domain}` : ""}
              </p>
            </Card>
          </Link>
        ))}
        {(companies ?? []).length === 0 && (
          <EmptyState
            text={
              q ? `No companies match "${q}".` : "No companies yet. Create your first one."
            }
          />
        )}
      </div>
    </AppShell>
  );
}
