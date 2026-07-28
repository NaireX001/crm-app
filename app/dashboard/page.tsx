import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Filter, MoreHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { cn, formatRelativeTime, displayName } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: deals },
    { data: stages },
    { data: tasks },
    { data: activities },
    { count: contactsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
    supabase.from("deals").select("id, name, value, stage_id, close_date"),
    supabase.from("pipeline_stages").select("*").order("sort_order"),
    supabase
      .from("tasks")
      .select(
        "id, title, due_date, status, priority, assigned_to, profiles(full_name, email)"
      )
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(6),
    supabase
      .from("activities")
      .select("id, type, subject, body, occurred_at, profiles(full_name, email)")
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

  const maxStageValue = Math.max(1, ...stageSummary.map((s) => s.value));

  const openValue = (deals ?? [])
    .filter((d) => {
      const stage = stages?.find((s) => s.id === d.stage_id);
      return stage && !stage.is_won && !stage.is_lost;
    })
    .reduce((sum, d) => sum + Number(d.value ?? 0), 0);

  const wonValue = (deals ?? [])
    .filter((d) => stages?.find((s) => s.id === d.stage_id)?.is_won)
    .reduce((sum, d) => sum + Number(d.value ?? 0), 0);

  const openDealsCount = (deals ?? []).filter((d) => {
    const stage = stages?.find((s) => s.id === d.stage_id);
    return stage && !stage.is_won && !stage.is_lost;
  }).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = (profile?.full_name || profile?.email || user.email || "")
    .split(/[\s@]/)[0];

  return (
    <AppShell active="/dashboard">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-gray-600">
            Here&apos;s your overview for today.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400"
          title="AI Assistant — coming soon"
        >
          <Sparkles size={15} />
          AI Assistant — coming soon
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (won)" value={`$${wonValue.toLocaleString()}`} />
        <StatCard label="Active Contacts" value={String(contactsCount ?? 0)} />
        <StatCard label="Open Deals" value={String(openDealsCount)} />
        <StatCard label="Email Open Rate" value="—" comingSoon />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pipeline Overview</h2>
            <Filter size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {stageSummary.map((s) => (
              <div key={s.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm text-gray-600">
                  {s.name}
                </span>
                <div className="h-2.5 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                    style={{
                      width: `${Math.max(
                        4,
                        (s.value / maxStageValue) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    ${s.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {s.count} deal{s.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ))}
            {stageSummary.length === 0 && (
              <EmptyState text="No pipeline stages found. Re-run supabase/schema.sql." />
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <MoreHorizontal size={16} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {(activities ?? []).map((a: any) => (
              <div key={a.id} className="flex gap-3">
                <Avatar name={displayName(a.profiles)} className="mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-900">
                      {displayName(a.profiles)}
                    </span>{" "}
                    logged a <span className="capitalize">{a.type}</span>
                    {a.subject ? ` — ${a.subject}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatRelativeTime(a.occurred_at)}
                  </p>
                </div>
              </div>
            ))}
            {(activities ?? []).length === 0 && (
              <EmptyState text="No activity logged yet." />
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Upcoming Tasks</h2>
          <Link
            href="/tasks"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>

        {(tasks ?? []).length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-medium">Task</th>
                <th className="pb-2 font-medium">Assignee</th>
                <th className="pb-2 font-medium">Due date</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(tasks ?? []).map((t: any) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td
                    className={cn(
                      "py-3 pr-4 font-medium",
                      t.status === "completed"
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    )}
                  >
                    {t.title}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={displayName(t.profiles)} className="h-6 w-6 text-[10px]" />
                      <span className="text-gray-600">
                        {displayName(t.profiles)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {t.due_date ?? "—"}
                  </td>
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  <td className="py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState text="No tasks yet." />
        )}
      </Card>
    </AppShell>
  );
}
