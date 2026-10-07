import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

export type ContainerProps = ComponentPropsWithRef<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-6", className)}
      {...props}
    />
  );
}
