import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: deals },
    { data: stages },
    { data: tasks },
    { data: activities },
    { count: contactsCount },
  ] = await Promise.all([
    supabase.from("deals").select("id, name, value, stage_id, close_date"),
    supabase.from("pipeline_stages").select("*").order("sort_order"),
    supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .eq("status", "pending")
      .order("due_date", { ascending: true })
      .limit(5),
    supabase
      .from("activities")
      .select("id, type, subject, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
  ]);

  const stageSummary = (stages ?? []).map((stage) => {
    const stageDeals = (deals ?? []).filter((d) => d.stage_id === stage.id);
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + Number(d.value ?? 0), 0),
    };
  });

  const openValue = (deals ?? [])
    .filter((d) => {
      const stage = stages?.find((s) => s.id === d.stage_id);
      return stage && !stage.is_won && !stage.is_lost;
    })
    .reduce((sum, d) => sum + Number(d.value ?? 0), 0);

  return (
    <AppShell active="/dashboard">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Open pipeline value"
          value={`$${openValue.toLocaleString()}`}
        />
        <StatCard label="Contacts" value={String(contactsCount ?? 0)} />
        <StatCard label="Open tasks" value={String(tasks?.length ?? 0)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Deals by stage</h2>
          <div className="space-y-2">
            {stageSummary.map((s) => (
              <Card
                key={s.id}
                className="flex items-center justify-between py-3"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-gray-600">
                  {s.count} deal{s.count === 1 ? "" : "s"} · $
                  {s.value.toLocaleString()}
                </span>
              </Card>
            ))}
            {stageSummary.length === 0 && (
              <EmptyState text="No pipeline stages found. Re-run supabase/schema.sql." />
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Upcoming tasks</h2>
          <div className="space-y-2">
            {(tasks ?? []).map((t) => (
              <Card key={t.id} className="py-3">
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-600">
                  {t.due_date ? `Due ${t.due_date}` : "No due date"}
                </p>
              </Card>
            ))}
            {(tasks ?? []).length === 0 && (
              <EmptyState text="No pending tasks." />
            )}
          </div>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Recent activity</h2>
        <div className="space-y-2">
          {(activities ?? []).map((a) => (
            <Card key={a.id} className="py-3 text-sm">
              <span className="font-medium capitalize">{a.type}</span>
              {a.subject ? ` — ${a.subject}` : ""}
              <span className="ml-2 text-gray-500">
                {new Date(a.occurred_at).toLocaleString()}
              </span>
            </Card>
          ))}
          {(activities ?? []).length === 0 && (
            <EmptyState text="No activity logged yet." />
          )}
        </div>
      </section>
    </AppShell>
  );
}
