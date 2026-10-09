"use client";

import { ArrowUp, Square } from "lucide-react";
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

export function ChatInput({ onSend, onStop, busy, maxLength }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && value.length <= maxLength && !busy;

  const submit = () => {
    if (!canSend) return;
    track("chat_message_sent");
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
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
      className="border-t border-border px-4 py-3"
    >
      <div className="flex items-end gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <Textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          maxLength={maxLength}
          rows={2}
          placeholder="Ask about Pritam…"
          className="min-h-16 flex-1 resize-none py-2.5"
          aria-describedby="chat-input-counter"
        />
        <div className="flex flex-col items-center gap-1.5">
          {busy ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onStop}
              aria-label="Stop response"
              className="size-11 rounded-full px-0"
            >
              <Square className="size-3.5" aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              aria-label="Send message"
              className="size-11 rounded-full px-0"
            >
              <ArrowUp className="size-4" aria-hidden="true" />
            </Button>
          )}
          <span
            id="chat-input-counter"
            className="text-[0.65rem] tabular-nums text-muted-foreground"
          >
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </form>
  );
}
