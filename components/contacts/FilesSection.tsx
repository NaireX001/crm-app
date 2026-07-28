import { Paperclip, Download, Trash2 } from "lucide-react";
import { uploadContactFile, deleteContactFile } from "@/lib/contacts/files";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface FileRow {
  id: string;
  file_name: string;
  storage_path: string;
  size_bytes: number | null;
  url: string | null;
}

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesSection({
  contactId,
  files,
  bucketMissing,
}: {
  contactId: string;
  files: FileRow[];
  bucketMissing: boolean;
}) {
  return (
    <div id="files" className="rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Paperclip size={16} className="text-gray-400" />
        <h2 className="font-semibold text-gray-900">Files</h2>
      </div>

      {bucketMissing && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Storage bucket &quot;contact-files&quot; doesn&apos;t exist yet in
          Supabase. Create it under Storage → New bucket (private) to enable
          uploads.
        </p>
      )}

      <form
        action={uploadContactFile}
        encType="multipart/form-data"
        className="mb-4 flex items-center gap-2"
      >
        <input type="hidden" name="contact_id" value={contactId} />
        <input type="file" name="file" required className="text-xs" />
        <Button type="submit" variant="secondary" className="shrink-0 text-xs">
          Upload
        </Button>
      </form>

      <div className="space-y-2">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              {f.url ? (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 truncate font-medium text-indigo-600 hover:underline"
                >
                  <Download size={13} />
                  {f.file_name}
                </a>
              ) : (
                <span className="truncate font-medium text-gray-700">
                  {f.file_name}
                </span>
              )}
              <p className="text-xs text-gray-400">{formatSize(f.size_bytes)}</p>
            </div>
            <form action={deleteContactFile}>
              <input type="hidden" name="contact_id" value={contactId} />
              <input type="hidden" name="file_id" value={f.id} />
              <input type="hidden" name="storage_path" value={f.storage_path} />
              <button
                type="submit"
                className="text-gray-400 hover:text-red-600"
                aria-label="Delete file"
              >
                <Trash2 size={14} />
              </button>
            </form>
          </div>
        ))}
        {files.length === 0 && <EmptyState text="No files uploaded yet." />}
      </div>
    </div>
  );
}
