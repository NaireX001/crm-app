import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import {
  deleteContact,
  updateContactOwner,
  updateContactDnd,
  updateContactCustomFields,
} from "@/lib/contacts/actions";
import { createActivity } from "@/lib/activities/actions";
import { createTask } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ContactDetailsForm } from "@/components/contacts/ContactDetailsForm";
import { FollowersSection } from "@/components/contacts/FollowersSection";
import { FilesSection } from "@/components/contacts/FilesSection";
import { ConversationsPlaceholder } from "@/components/contacts/ConversationsPlaceholder";
import { QuickAccessRail } from "@/components/contacts/QuickAccessRail";
import { displayName } from "@/lib/utils";

export default async function ContactDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; message?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: viewerProfile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const isAdmin = viewerProfile?.role === "admin";

  const [
    { data: contact },
    { data: companies },
    { data: activities },
    { data: tasks },
    { data: allProfiles },
    { data: followerRows },
    { data: fileRows },
  ] = await Promise.all([
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
    supabase.from("profiles").select("id, email, full_name").order("email"),
    supabase
      .from("contact_followers")
      .select("user_id, profiles(id, email, full_name)")
      .eq("contact_id", params.id),
    supabase
      .from("contact_files")
      .select("*")
      .eq("contact_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!contact) {
    notFound();
  }

  // Prev/next navigation + position, scoped to whatever this user can see.
  const [{ data: prevContact }, { data: nextContact }, { count: position }, { count: total }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id")
        .lt("created_at", contact.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("contacts")
        .select("id")
        .gt("created_at", contact.created_at)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .lte("created_at", contact.created_at),
      supabase.from("contacts").select("id", { count: "exact", head: true }),
    ]);

  // Resolve signed URLs for files (bucket may not exist yet — handle gracefully).
  let bucketMissing = false;
  const files = await Promise.all(
    (fileRows ?? []).map(async (f) => {
      const { data: signed, error } = await supabase.storage
        .from("contact-files")
        .createSignedUrl(f.storage_path, 60 * 60);
      if (error && /bucket/i.test(error.message)) bucketMissing = true;
      return { ...f, url: signed?.signedUrl ?? null };
    })
  );

  const followers = (followerRows ?? [])
    .map((r: any) => r.profiles)
    .filter(Boolean);

  const redirectTo = `/contacts/${params.id}`;

  return (
    <AppShell active="/contacts">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={`${contact.first_name} ${contact.last_name ?? ""}`} className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-gray-900">
            {contact.first_name} {contact.last_name ?? ""}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {prevContact ? (
              <Link
                href={`/contacts/${prevContact.id}`}
                className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"
              >
                <ChevronLeft size={15} />
              </Link>
            ) : (
              <span className="rounded-md border border-gray-100 p-1.5 text-gray-300">
                <ChevronLeft size={15} />
              </span>
            )}
            <span>
              {position ?? "?"}/{total ?? "?"}
            </span>
            {nextContact ? (
              <Link
                href={`/contacts/${nextContact.id}`}
                className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-50"
              >
                <ChevronRight size={15} />
              </Link>
            ) : (
              <span className="rounded-md border border-gray-100 p-1.5 text-gray-300">
                <ChevronRight size={15} />
              </span>
            )}
          </div>
          <form action={deleteContact}>
            <input type="hidden" name="contact_id" value={contact.id} />
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr_300px]">
        {/* LEFT: owner, followers, DND, details, custom fields */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-1 text-xs font-medium text-gray-500">Owner</p>
            {isAdmin ? (
              <form action={updateContactOwner} className="flex items-center gap-2">
                <input type="hidden" name="contact_id" value={contact.id} />
                <Select
                  name="owner_id"
                  defaultValue={contact.owner_id ?? ""}
                  className="text-sm"
                >
                  <option value="">Unassigned</option>
                  {(allProfiles ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {displayName(p)}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="secondary" className="shrink-0 text-xs">
                  Save
                </Button>
              </form>
            ) : (
              <p className="text-sm text-gray-700">
                {(allProfiles ?? []).find((p) => p.id === contact.owner_id)
                  ? displayName((allProfiles ?? []).find((p) => p.id === contact.owner_id))
                  : "Unassigned"}
              </p>
            )}

            <div className="my-4 border-t border-gray-100" />

            <FollowersSection
              contactId={contact.id}
              followers={followers}
              availableProfiles={allProfiles ?? []}
            />
          </Card>

          <Card>
            <p className="mb-2 text-xs font-medium text-gray-500">
              Do Not Disturb
            </p>
            <form action={updateContactDnd} className="flex flex-col gap-2 text-sm">
              <input type="hidden" name="contact_id" value={contact.id} />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="dnd_email" defaultChecked={contact.dnd_email} />
                No email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="dnd_sms" defaultChecked={contact.dnd_sms} />
                No SMS
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="dnd_call" defaultChecked={contact.dnd_call} />
                No calls
              </label>
              <Button type="submit" variant="secondary" className="mt-1 self-start text-xs">
                Save DND settings
              </Button>
            </form>
          </Card>

          <ContactDetailsForm contact={contact} companies={companies ?? []} />

          {contact.company_id && (
            <p className="text-sm">
              <Link
                href={`/companies/${contact.company_id}`}
                className="text-gray-900 underline"
              >
                View company →
              </Link>
            </p>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              Custom fields
            </h2>
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <form
                action={updateContactCustomFields}
                className="flex flex-col gap-3"
              >
                <input type="hidden" name="contact_id" value={contact.id} />
                {Object.entries(contact.custom_fields ?? {}).map(([k, v], i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input name="field_key" defaultValue={k} className="w-1/3" />
                    <Input name="field_value" defaultValue={v} className="flex-1" />
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input name="field_key" placeholder="New field name" className="w-1/3" />
                  <Input name="field_value" placeholder="Value" className="flex-1" />
                </div>
                <Button type="submit" variant="secondary" className="self-start text-xs">
                  Save custom fields
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* MIDDLE: conversations (visual placeholder) */}
        <ConversationsPlaceholder />

        {/* RIGHT: quick access + activity + tasks + files + website activity */}
        <div className="flex flex-col gap-4">
          <QuickAccessRail />

          <div id="activity">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Activity</h2>
            <form
              action={createActivity}
              className="mb-3 flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3"
            >
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <div className="flex gap-2">
                <Select name="type" defaultValue="note" className="w-28 shrink-0 text-xs">
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </Select>
                <Input name="subject" placeholder="Subject" className="text-xs" />
              </div>
              <Textarea name="body" placeholder="Details…" rows={2} className="text-xs" />
              <Button type="submit" variant="secondary" className="self-start text-xs">
                Log
              </Button>
            </form>
            <div className="space-y-2">
              {(activities ?? []).map((a) => (
                <Card key={a.id} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{a.type}</span>
                    <span className="text-gray-500">
                      {new Date(a.occurred_at).toLocaleDateString()}
                    </span>
                  </div>
                  {a.subject && <p className="mt-1">{a.subject}</p>}
                  {a.body && <p className="mt-1 text-gray-600">{a.body}</p>}
                </Card>
              ))}
              {(activities ?? []).length === 0 && (
                <EmptyState text="No activity logged yet." />
              )}
            </div>
          </div>

          <div id="tasks">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">Tasks</h2>
            <form
              action={createTask}
              className="mb-3 flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-3"
            >
              <input type="hidden" name="contact_id" value={contact.id} />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <Input name="title" placeholder="Follow up about…" required className="text-xs" />
              <Input name="due_date" type="date" className="text-xs" />
              <Button type="submit" variant="secondary" className="self-start text-xs">
                Add task
              </Button>
            </form>
            <div className="space-y-2">
              {(tasks ?? []).map((t) => (
                <Card key={t.id} className="text-xs">
                  <p className={t.status === "completed" ? "text-gray-400 line-through" : "font-medium"}>
                    {t.title}
                  </p>
                  <p className="text-gray-500">
                    {t.due_date ? `Due ${t.due_date}` : "No due date"}
                  </p>
                </Card>
              ))}
              {(tasks ?? []).length === 0 && (
                <EmptyState text="No tasks linked to this contact." />
              )}
            </div>
            <p className="mt-2 text-xs">
              <Link href="/tasks" className="text-gray-900 underline">
                Manage all tasks →
              </Link>
            </p>
          </div>

          <FilesSection contactId={contact.id} files={files} bucketMissing={bucketMissing} />

          <div className="rounded-md border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <Globe size={15} className="text-gray-300" />
              <h2 className="text-sm font-semibold text-gray-400">
                Website Activity — Soon
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Page visits and form submissions will show up here once a
              tracking script is added to your website.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
