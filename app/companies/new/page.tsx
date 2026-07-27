import { AppShell } from "@/components/layout/AppShell";
import { createCompany } from "@/lib/companies/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export default function NewCompanyPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AppShell active="/companies">
      <h1 className="mb-6 text-2xl font-bold">New company</h1>

      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={createCompany} className="flex max-w-lg flex-col gap-4">
        <div>
          <Label htmlFor="name">Company name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="domain">Website / domain</Label>
          <Input id="domain" name="domain" placeholder="acme.com" />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" name="industry" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" rows={4} />
        </div>
        <Button type="submit">Create company</Button>
      </form>
    </AppShell>
  );
}
