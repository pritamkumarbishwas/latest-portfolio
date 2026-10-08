import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div
      data-reveal
      suppressHydrationWarning
      className={cn("reveal-fade", className)}
      style={
        delay > 0
          ? ({ "--reveal-delay": `${delay}s` } as CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
