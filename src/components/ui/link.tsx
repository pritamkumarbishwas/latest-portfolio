import type { ReactNode } from "react";
import NextLink, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils";

export type UiLinkProps = LinkProps & {
  className?: string;
  children: ReactNode;
};

export function Link({ className, children, ...props }: UiLinkProps) {
  return (
    <NextLink
      className={cn(
        "inline-flex items-center gap-1 text-foreground underline-offset-4 transition-colors hover:text-accent-text hover:underline",
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}
