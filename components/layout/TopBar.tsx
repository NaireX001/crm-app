import { Search, Bell } from "lucide-react";
import { CreateMenu } from "@/components/layout/CreateMenu";
import { UserMenu } from "@/components/layout/UserMenu";

export function TopBar({
  email,
  role,
}: {
  email: string;
  role: string | null;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3.5">
      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          placeholder="Search or ask AI…"
          title="Search — coming soon"
          disabled
          className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-14 text-sm text-gray-500 placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
          ⌘K
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <CreateMenu />
        <button
          type="button"
          title="Notifications — coming soon"
          disabled
          className="rounded-md border border-gray-200 p-2 text-gray-400 disabled:cursor-not-allowed"
        >
          <Bell size={16} />
        </button>
        <UserMenu email={email} role={role} />
      </div>
    </header>
  );
}
