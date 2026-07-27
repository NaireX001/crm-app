import { AppShell } from "@/components/layout/AppShell";
import { createContact } from "@/lib/contacts/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .order("name");

  return (
    <AppShell active="/contacts">
      <h1 className="mb-6 text-2xl font-bold">New contact</h1>

      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={createContact} className="flex max-w-lg flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First name</Label>
            <Input id="first_name" name="first_name" required />
          </div>
          <div>
            <Label htmlFor="last_name">Last name</Label>
            <Input id="last_name" name="last_name" />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div>
          <Label htmlFor="company_id">Company</Label>
          <Select id="company_id" name="company_id" defaultValue="">
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
          <Input id="tags" name="tags" placeholder="lead, priority" />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={4} />
        </div>
        <Button type="submit">Create contact</Button>
      </form>
    </AppShell>
  );
}
