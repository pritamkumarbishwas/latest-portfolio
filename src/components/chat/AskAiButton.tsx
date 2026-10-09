"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { useChatOpen } from "./ChatProvider";

/** Drop-in "Ask my AI" trigger for the hero (or anywhere inside ChatProvider). */
export function AskAiButton({ className }: { className?: string }) {
  const { openChat } = useChatOpen();

  return (
    <button
      type="button"
      onClick={openChat}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition-[color,border-color,transform] duration-200 hover:border-accent-text hover:text-accent-text motion-safe:hover:-translate-y-0.5",
        className,
      )}
    >
      <Sparkles className="size-4 text-accent-text" aria-hidden="true" />
      Ask my AI
    </button>
  );
}
