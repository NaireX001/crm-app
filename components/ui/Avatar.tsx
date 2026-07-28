import { cn } from "@/lib/utils";

function getInitials(source: string) {
  const namePart = source.split("@")[0];
  const pieces = namePart.split(/[.\s_-]+/).filter(Boolean);
  if (pieces.length >= 2) {
    return (pieces[0][0] + pieces[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
