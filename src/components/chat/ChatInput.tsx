"use client";

import { Send, Square } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";
import { track } from "@vercel/analytics";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type ChatInputProps = {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  maxLength: number;
};

/** Grow the composer up to ~6 lines, then scroll internally. */
const AUTO_GROW_MAX_PX = 152;
/** Only surface the counter once the visitor is close to the limit. */
const COUNTER_THRESHOLD = 0.8;

export function ChatInput({ onSend, onStop, busy, maxLength }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && value.length <= maxLength && !busy;
  const showCounter = value.length >= Math.floor(maxLength * COUNTER_THRESHOLD);
  const atLimit = value.length >= maxLength;

  const autoGrow = () => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, AUTO_GROW_MAX_PX)}px`;
  };

  const handleChange = (next: string) => {
    setValue(next);
    autoGrow();
  };

  const submit = () => {
    if (!canSend) return;
    track("chat_message_sent");
    onSend(trimmed);
    setValue("");
    const element = textareaRef.current;
    if (element) {
      element.style.height = "auto";
      element.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="border-t border-border bg-card p-4"
    >
      <div className="relative flex items-end gap-2 rounded-3xl border border-border bg-muted/40 p-1.5 transition-shadow focus-within:border-accent-text/40 focus-within:ring-2 focus-within:ring-accent-text/15">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <Textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          maxLength={maxLength}
          rows={1}
          placeholder="Ask about Pritam…"
          className="max-h-[9.5rem] min-h-11 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-3 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-describedby={showCounter ? "chat-input-counter" : undefined}
        />
        <div className="flex shrink-0 items-center gap-2 pb-1 pr-1">
          {showCounter ? (
            <span
              id="chat-input-counter"
              className={`text-[0.65rem] tabular-nums ${atLimit ? "text-red-500" : "text-muted-foreground"
                }`}
            >
              {value.length}/{maxLength}
            </span>
          ) : null}
          {busy ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onStop}
              aria-label="Stop response"
              className="size-11 rounded-full bg-background shadow-sm hover:bg-muted sm:size-9"
            >
              <Square className="size-3.5 text-foreground" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              aria-label="Send message"
              className="size-11 rounded-full shadow-sm transition-transform active:scale-95 sm:size-9"
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
