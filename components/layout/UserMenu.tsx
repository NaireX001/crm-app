"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { signOut } from "@/lib/auth/actions";

export function UserMenu({
  email,
  role,
}: {
  email: string;
  role: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        <Avatar name={email} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-900">
              {email}
            </p>
            {role && (
              <p className="text-xs capitalize text-gray-500">{role}</p>
            )}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={15} className="text-gray-400" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
