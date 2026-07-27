import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { updateCompany, deleteCompany } from "@/lib/companies/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; message?: string };
}) {
  const supabase = await createClient();

  const [{ data: company }, { data: contacts }, { data: deals }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", params.id).single(),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, email")
      .eq("company_id", params.id)
      .order("first_name"),
    supabase
      .from("deals")
      .select("id, name, value, stage_id, pipeline_stages(name)")
      .eq("company_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <AppShell active="/companies">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{company.name}</h1>
        <form action={deleteCompany}>
          <input type="hidden" name="company_id" value={company.id} />
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
            action={updateCompany}
            className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-4"
          >
            <input type="hidden" name="company_id" value={company.id} />
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" name="name" required defaultValue={company.name} />
            </div>
            <div>
              <Label htmlFor="domain">Website / domain</Label>
              <Input id="domain" name="domain" defaultValue={company.domain ?? ""} />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" name="industry" defaultValue={company.industry ?? ""} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={company.phone ?? ""} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={company.address ?? ""} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} defaultValue={company.notes ?? ""} />
            </div>
            <Button type="submit" className="self-start">
              Save changes
            </Button>
          </form>
        </section>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Contacts</h2>
            <div className="space-y-2">
              {(contacts ?? []).map((c) => (
                <Link key={c.id} href={`/contacts/${c.id}`}>
                  <Card className="text-sm transition-colors hover:border-gray-400">
                    <p className="font-medium">
                      {c.first_name} {c.last_name ?? ""}
                    </p>
                    <p className="text-gray-600">{c.email ?? "No email"}</p>
                  </Card>
                </Link>
              ))}
              {(contacts ?? []).length === 0 && (
                <EmptyState text="No contacts linked to this company yet." />
              )}
            </div>
            <p className="mt-2 text-sm">
              <Link href={`/contacts/new`} className="text-gray-900 underline">
                Add a contact →
              </Link>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Deals</h2>
            <div className="space-y-2">
              {(deals ?? []).map((d) => (
                <Card key={d.id} className="text-sm">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-gray-600">
                    ${Number(d.value).toLocaleString()} ·{" "}
                    {(d.pipeline_stages as any)?.name ?? "Unknown stage"}
                  </p>
                </Card>
              ))}
              {(deals ?? []).length === 0 && (
                <EmptyState text="No deals linked to this company yet." />
              )}
            </div>
            <p className="mt-2 text-sm">
              <Link href="/deals/new" className="text-gray-900 underline">
                Add a deal →
              </Link>
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
