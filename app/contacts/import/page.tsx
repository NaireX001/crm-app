import { AppShell } from "@/components/layout/AppShell";
import { importContacts } from "@/lib/contacts/import";
import { Button } from "@/components/ui/Button";

export default function ImportContactsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AppShell active="/contacts">
      <h1 className="mb-2 text-2xl font-bold">Import contacts</h1>
      <p className="mb-6 max-w-lg text-gray-600">
        Upload a CSV file. The first row must be a header row. Recognized
        columns (case-insensitive):{" "}
        <code className="rounded bg-gray-100 px-1">first_name</code>{" "}
        (required),{" "}
        <code className="rounded bg-gray-100 px-1">last_name</code>,{" "}
        <code className="rounded bg-gray-100 px-1">email</code>,{" "}
        <code className="rounded bg-gray-100 px-1">phone</code>,{" "}
        <code className="rounded bg-gray-100 px-1">company</code>,{" "}
        <code className="rounded bg-gray-100 px-1">tags</code> (separate
        multiple with <code className="rounded bg-gray-100 px-1">;</code> or{" "}
        <code className="rounded bg-gray-100 px-1">|</code>), and{" "}
        <code className="rounded bg-gray-100 px-1">notes</code>. Companies
        that don&apos;t exist yet are created automatically.
      </p>

      {searchParams.error && (
        <p className="mb-4 max-w-lg rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form
        action={importContacts}
        encType="multipart/form-data"
        className="flex max-w-md flex-col gap-4 rounded-md border border-gray-200 bg-white p-4"
      >
        <input type="file" name="file" accept=".csv" required className="text-sm" />
        <Button type="submit" className="self-start">
          Upload and import
        </Button>
      </form>
    </AppShell>
  );
}
