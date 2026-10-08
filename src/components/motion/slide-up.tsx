import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SlideUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  return (
    <div
      data-reveal
      suppressHydrationWarning
      className={cn("reveal-up", className)}
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
