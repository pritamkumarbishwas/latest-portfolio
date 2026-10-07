import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StaggerProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
  delay?: number;
  staggerChildren?: number;
};

export function Stagger({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  staggerChildren = 0.1,
}: StaggerProps) {
  return (
    <Tag
      className={cn("stagger", className)}
      style={
        {
          "--stagger-base": `${delay}s`,
          "--stagger-step": `${staggerChildren}s`,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}

export type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className, as: Tag = "div" }: StaggerItemProps) {
  return (
    <Tag data-reveal className={cn("reveal-up", className)}>
      {children}
    </Tag>
  );
}
