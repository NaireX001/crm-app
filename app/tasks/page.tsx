import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { createTask, toggleTaskStatus, deleteTask } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriorityBadge } from "@/components/ui/Badge";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();

  const [{ data: tasks }, { data: contacts }, { data: deals }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, contacts(id, first_name, last_name), deals(id, name)")
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("contacts").select("id, first_name, last_name").order("first_name"),
    supabase.from("deals").select("id, name").order("name"),
  ]);

  const pending = (tasks ?? []).filter((t) => t.status === "pending");
  const completed = (tasks ?? []).filter((t) => t.status === "completed");

  return (
    <AppShell active="/tasks">
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>

      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form
        action={createTask}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4"
      >
        <input type="hidden" name="redirect_to" value="/tasks" />
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="title">Task</Label>
          <Input id="title" name="title" placeholder="Follow up with…" required />
        </div>
        <div>
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" name="due_date" type="date" />
        </div>
        <div className="min-w-[160px]">
          <Label htmlFor="contact_id">Contact</Label>
          <Select id="contact_id" name="contact_id" defaultValue="">
            <option value="">— none —</option>
            {(contacts ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name ?? ""}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Label htmlFor="deal_id">Deal</Label>
          <Select id="deal_id" name="deal_id" defaultValue="">
            <option value="">— none —</option>
            {(deals ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[120px]">
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
        <Button type="submit">Add task</Button>
      </form>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">
          Pending ({pending.length})
        </h2>
        <div className="space-y-2">
          {pending.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
          {pending.length === 0 && <EmptyState text="Nothing pending — nice work." />}
        </div>
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Completed ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function TaskRow({ task }: { task: any }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p
          className={
            task.status === "completed"
              ? "text-gray-400 line-through"
              : "font-medium"
          }
        >
          {task.title}
        </p>
        <div className="mt-1">
          <PriorityBadge priority={task.priority ?? "medium"} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {task.due_date ? `Due ${task.due_date}` : "No due date"}
          {task.contacts && (
            <>
              {" · "}
              <Link
                href={`/contacts/${task.contacts.id}`}
                className="underline"
              >
                {task.contacts.first_name} {task.contacts.last_name ?? ""}
              </Link>
            </>
          )}
          {task.deals && (
            <>
              {" · "}
              <Link href="/deals" className="underline">
                {task.deals.name}
              </Link>
            </>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <form action={toggleTaskStatus}>
          <input type="hidden" name="task_id" value={task.id} />
          <input type="hidden" name="current_status" value={task.status} />
          <input type="hidden" name="redirect_to" value="/tasks" />
          <Button type="submit" variant="secondary">
            {task.status === "completed" ? "Mark pending" : "Mark done"}
          </Button>
        </form>
        <form action={deleteTask}>
          <input type="hidden" name="task_id" value={task.id} />
          <input type="hidden" name="redirect_to" value="/tasks" />
          <Button type="submit" variant="danger">
            Delete
          </Button>
        </form>
      </div>
    </Card>
  );
}
