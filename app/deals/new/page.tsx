import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { createDeal } from "@/lib/deals/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

export default async function NewDealPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const [{ data: stages }, { data: contacts }, { data: companies }] =
    await Promise.all([
      supabase.from("pipeline_stages").select("*").order("sort_order"),
      supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .order("first_name"),
      supabase.from("companies").select("id, name").order("name"),
    ]);

  return (
    <AppShell active="/deals">
      <h1 className="mb-6 text-2xl font-bold">New deal</h1>

      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={createDeal} className="flex max-w-lg flex-col gap-4">
        <div>
          <Label htmlFor="name">Deal name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="value">Value (USD)</Label>
          <Input
            id="value"
            name="value"
            type="number"
            step="0.01"
            min="0"
            defaultValue={0}
          />
        </div>
        <div>
          <Label htmlFor="stage_id">Stage</Label>
          <Select
            id="stage_id"
            name="stage_id"
            required
            defaultValue={stages?.[0]?.id}
          >
            {(stages ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="contact_id">Contact (optional)</Label>
          <Select id="contact_id" name="contact_id" defaultValue="">
            <option value="">— none —</option>
            {(contacts ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name ?? ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="company_id">Company (optional)</Label>
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
          <Label htmlFor="close_date">Expected close date</Label>
          <Input id="close_date" name="close_date" type="date" />
        </div>
        <Button type="submit">Create deal</Button>
      </form>
    </AppShell>
  );
}
