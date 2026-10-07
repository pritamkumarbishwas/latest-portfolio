import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-32 w-full rounded-lg border border-border-strong bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground",
        "aria-invalid:border-accent-text",
        className,
      )}
      {...props}
    />
  );
}
