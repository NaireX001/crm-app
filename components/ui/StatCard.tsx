import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  trend,
  comingSoon,
}: {
  label: string;
  value: string;
  trend?: { label: string; direction: "up" | "down" };
  comingSoon?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>
        {trend && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.direction === "up"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            )}
          >
            {trend.label}
          </span>
        )}
        {comingSoon && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">
            Soon
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 text-2xl font-bold",
          comingSoon ? "text-gray-300" : "text-gray-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}
