import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { updateContact, deleteContact } from "@/lib/contacts/actions";
import { createActivity } from "@/lib/activities/actions";
import { createTask } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; message?: string };
}) {
  const supabase = await createClient();

  const [{ data: contact }, { data: companies }, { data: activities }, { data: tasks }] =
    await Promise.all([
      supabase.from("contacts").select("*").eq("id", params.id).single(),
      supabase.from("companies").select("id, name").order("name"),
      supabase
        .from("activities")
        .select("*")
        .eq("contact_id", params.id)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("contact_id", params.id)
        .order("due_date", { ascending: true }),
    ]);

  if (!contact) {
    notFound();
  }

  const redirectTo = `/contacts/${params.id}`;

  return (
    <AppShell active="/contacts">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {contact.first_name} {contact.last_name ?? ""}
        </h1>
        <form action={deleteContact}>
          <input type="hidden" name="contact_id" value={contact.id} />
          <Button type="submit" variant="danger">
            Delete
          </Button>
        </form>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Details</h2>
          <form
            action={updateContact}
            className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-4"
          >
            <input type="hidden" name="contact_id" value={contact.id} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={contact.first_name}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={contact.last_name ?? ""}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={contact.email ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={contact.phone ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="company_id">Company</Label>
              <Select
                id="company_id"
                name="company_id"
                defaultValue={contact.company_id ?? ""}
              >
                <option value="">— none —</option>
                {(companies ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={(contact.tags ?? []).join(", ")}
              />
            </div>
            <div>
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

          {contact.company_id && (
            <p className="mt-3 text-sm">
              <Link
                href={`/companies/${contact.company_id}`}
                className="text-gray-900 underline"
              >
                View company →
              </Link>
            </p>
          )}
        </section>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Activity</h2>
            <form
              action={createActivity}
              className="mb-4 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4"
            >
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <div className="flex gap-3">
                <Select name="type" defaultValue="note" className="w-32 shrink-0">
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </Select>
                <Input name="subject" placeholder="Subject (optional)" />
              </div>
              <Textarea name="body" placeholder="Details…" rows={2} />
              <Button type="submit" variant="secondary" className="self-start">
                Log activity
              </Button>
            </form>
            <div className="space-y-2">
              {(activities ?? []).map((a) => (
                <Card key={a.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{a.type}</span>
                    <span className="text-gray-500">
                      {new Date(a.occurred_at).toLocaleString()}
                    </span>
                  </div>
                  {a.subject && <p className="mt-1">{a.subject}</p>}
                  {a.body && <p className="mt-1 text-gray-600">{a.body}</p>}
                </Card>
              ))}
              {(activities ?? []).length === 0 && (
                <EmptyState text="No activity logged for this contact yet." />
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Tasks</h2>
            <form
              action={createTask}
              className="mb-4 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4"
            >
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <Input name="title" placeholder="Follow up about…" required />
              <Input name="due_date" type="date" />
              <Button type="submit" variant="secondary" className="self-start">
                Add task
              </Button>
            </form>
            <div className="space-y-2">
              {(tasks ?? []).map((t) => (
                <Card key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className={t.status === "completed" ? "line-through text-gray-400" : "font-medium"}>
                      {t.title}
                    </p>
                    <p className="text-gray-500">
                      {t.due_date ? `Due ${t.due_date}` : "No due date"}
                    </p>
                  </div>
                </Card>
              ))}
              {(tasks ?? []).length === 0 && (
                <EmptyState text="No tasks linked to this contact." />
              )}
            </div>
            <p className="mt-2 text-sm">
              <Link href="/tasks" className="text-gray-900 underline">
                Manage all tasks →
              </Link>
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
