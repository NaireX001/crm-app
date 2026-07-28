"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, User, Building2, Target, CheckSquare } from "lucide-react";

const OPTIONS = [
  { href: "/contacts/new", label: "Contact", icon: User },
  { href: "/companies/new", label: "Company", icon: Building2 },
  { href: "/deals/new", label: "Deal", icon: Target },
  { href: "/tasks", label: "Task", icon: CheckSquare },
];

export function CreateMenu() {
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
      >
        <Plus size={16} />
        Create
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {OPTIONS.map((opt) => (
            <Link
              key={opt.href}
              href={opt.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <opt.icon size={15} className="text-gray-400" />
              New {opt.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
