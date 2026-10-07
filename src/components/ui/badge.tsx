import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "accent" | "outline";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default: "border border-border bg-card text-muted-foreground",
  accent: "bg-accent text-accent-foreground",
  outline: "border border-border text-foreground",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
