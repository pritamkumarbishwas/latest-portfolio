"use client";

import type { TextUIPart, UIMessage } from "ai";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { MessageMarkdown } from "./MessageMarkdown";

export type MessageListProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
};

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextUIPart => part.type === "text")
    .map((part) => part.text)
    .join("");
}

const SCROLL_STICKY_PX = 80;

export function MessageList({ messages, status }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    stickToBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      SCROLL_STICKY_PX;
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !stickToBottom.current) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, status]);

  const lastMessage = messages[messages.length - 1];
  const showTyping =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      messageText(lastMessage).length === 0);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Chat messages"
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ask about Pritam’s experience, projects, skills, or availability.
        </p>
      ) : null}

      {messages.map((message) => {
        const text = messageText(message);
        if (!text) return null;
        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={cn("flex", isUser ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm",
                isUser
                  ? "rounded-br-md bg-accent text-accent-foreground"
                  : "rounded-bl-md bg-muted text-foreground",
              )}
            >
              {isUser ? text : <MessageMarkdown text={text} />}
            </div>
          </div>
        );
      })}

      {showTyping ? (
        <div className="flex justify-start">
          <div
            className="rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
            </div>
            <span className="sr-only">Pritam’s assistant is typing…</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
