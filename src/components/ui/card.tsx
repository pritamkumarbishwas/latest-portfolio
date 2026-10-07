import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type CardProps = ComponentPropsWithRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 text-card-foreground motion-safe:duration-200 motion-safe:transition-transform motion-safe:hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
}
