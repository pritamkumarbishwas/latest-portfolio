import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[color,background-color,border-color,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary:
    "border border-border text-foreground hover:border-accent-text hover:text-accent-text",
  ghost: "text-muted-foreground hover:text-foreground",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-full px-4 text-sm",
  md: "min-h-11 rounded-full px-6 text-sm",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
