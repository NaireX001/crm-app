import {
  Clock,
  CheckSquare,
  Paperclip,
  Calendar,
  DollarSign,
  Workflow,
  Sparkles,
} from "lucide-react";

interface RailItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  soon?: boolean;
}

const ITEMS: RailItem[] = [
  { href: "#activity", label: "Activity", icon: Clock },
  { href: "#tasks", label: "Tasks", icon: CheckSquare },
  { href: "#files", label: "Files", icon: Paperclip },
  { label: "Calendar", icon: Calendar, soon: true },
  { label: "Payments", icon: DollarSign, soon: true },
  { label: "Automations", icon: Workflow, soon: true },
  { label: "AI Assistant", icon: Sparkles, soon: true },
];

/**
 * Vertical shortcut rail. Real items scroll to the matching section on this
 * page; "soon" items are inert placeholders for future integrations.
 */
export function QuickAccessRail() {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-gray-200 bg-white p-2">
      {ITEMS.map((item) =>
        item.soon ? (
          <div
            key={item.label}
            title={`${item.label} — coming soon`}
            className="cursor-not-allowed rounded-md p-2 text-gray-300"
          >
            <item.icon size={17} />
          </div>
        ) : (
          <a
            key={item.label}
            href={item.href}
            title={item.label}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <item.icon size={17} />
          </a>
        )
      )}
    </div>
  );
}
