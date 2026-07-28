import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700",
        className
      )}
    >
      {children}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge className={PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

const STATUS_DOT_STYLES: Record<string, string> = {
  completed: "bg-emerald-500",
  pending: "bg-gray-400",
};

const STATUS_TEXT_STYLES: Record<string, string> = {
  completed: "text-emerald-700",
  pending: "text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        STATUS_TEXT_STYLES[status] ?? STATUS_TEXT_STYLES.pending
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          STATUS_DOT_STYLES[status] ?? STATUS_DOT_STYLES.pending
        )}
      />
      {status === "completed" ? "Completed" : "Pending"}
    </span>
  );
}
