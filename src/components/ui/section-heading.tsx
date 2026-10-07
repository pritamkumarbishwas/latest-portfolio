import type { ReactNode } from "react";
import { SlideUp } from "@/components/motion";

type SectionHeadingProps = {
  id: string;
  label: string;
  children: ReactNode;
  as?: "h1" | "h2";
};

export function SectionHeading({
  id,
  label,
  children,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <SlideUp>
      <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <span aria-hidden="true" className="h-px w-8 bg-accent" />
        {label}
      </p>
      <Tag id={id} className="mt-4 font-display tracking-tight">
        {children}
      </Tag>
    </SlideUp>
  );
}
