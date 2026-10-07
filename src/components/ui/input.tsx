import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = ComponentPropsWithRef<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-border-strong bg-card px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground",
        "aria-invalid:border-accent-text",
        className,
      )}
      {...props}
    />
  );
}
