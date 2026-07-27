import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md border border-gray-200 bg-white p-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
