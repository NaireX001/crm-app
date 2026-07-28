import Link from "next/link";
import {
  Sparkles,
  Home,
  Users,
  Building2,
  Target,
  CheckSquare,
  Inbox,
  Calendar,
  Megaphone,
  Workflow,
  Bot,
  Globe,
  ShoppingCart,
  BarChart3,
  Folder,
  LayoutGrid,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, enabled: true },
  { href: "/contacts", label: "Contacts", icon: Users, enabled: true },
  { href: "/companies", label: "Companies", icon: Building2, enabled: true },
  { href: "/deals", label: "Deals", icon: Target, enabled: true },
  { href: "/tasks", label: "Tasks", icon: CheckSquare, enabled: true },
  { href: "#", label: "Inbox", icon: Inbox, enabled: false },
  { href: "#", label: "Calendar", icon: Calendar, enabled: false },
  { href: "#", label: "Marketing", icon: Megaphone, enabled: false },
  { href: "#", label: "Automation", icon: Workflow, enabled: false },
  { href: "#", label: "AI Assistant", icon: Bot, enabled: false },
  { href: "#", label: "Websites", icon: Globe, enabled: false },
  { href: "#", label: "Commerce", icon: ShoppingCart, enabled: false },
  { href: "#", label: "Analytics", icon: BarChart3, enabled: false },
  { href: "#", label: "Assets", icon: Folder, enabled: false },
  { href: "#", label: "Marketplace", icon: LayoutGrid, enabled: false },
];

export function Sidebar({ active }: { active: string }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-white">CRM</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.href;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600"
                title={`${item.label} — coming soon`}
              >
                <span className="flex items-center gap-3">
                  <item.icon size={17} />
                  {item.label}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-slate-800 font-medium text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-3 py-3">
        <div
          className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600"
          title="Settings — coming soon"
        >
          <span className="flex items-center gap-3">
            <Settings size={17} />
            Settings
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            Soon
          </span>
        </div>
      </div>
    </aside>
  );
}
