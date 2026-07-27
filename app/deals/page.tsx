import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { KanbanBoard } from "@/components/deals/KanbanBoard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";

export default async function DealsPage() {
  const supabase = await createClient();

  const [{ data: stages }, { data: deals }] = await Promise.all([
    supabase.from("pipeline_stages").select("*").order("sort_order"),
    supabase
      .from("deals")
      .select(
        "*, contacts(id, first_name, last_name), companies(id, name)"
      )
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AppShell active="/deals">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Link href="/deals/new">
          <Button>New deal</Button>
        </Link>
      </div>

      {stages && stages.length > 0 ? (
        <KanbanBoard deals={deals ?? []} stages={stages} />
      ) : (
        <EmptyState text="No pipeline stages found. Re-run supabase/schema.sql in the Supabase SQL Editor." />
      )}
    </AppShell>
  );
}
