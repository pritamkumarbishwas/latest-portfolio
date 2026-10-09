"use client";

import type { TextUIPart, UIMessage } from "ai";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { ChatMessageDraft, ChatProjectCardData } from "@/types/chat";
import { cn } from "@/lib/utils";

import { ContactConfirmCard } from "./ContactConfirmCard";
import { MessageMarkdown } from "./MessageMarkdown";
import { ProjectToolCard } from "./ProjectToolCard";

export type MessageListProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
};

export function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextUIPart => part.type === "text")
    .map((part) => part.text)
    .join("");
}

type ToolPartGuess = {
  type: string;
  state?: string;
  output?: unknown;
};

function isProjectCardData(output: unknown): output is ChatProjectCardData {
  if (typeof output !== "object" || output === null) return false;
  const record = output as Record<string, unknown>;
  return (
    typeof record.slug === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.techStack)
  );
}

function isMessageDraft(output: unknown): output is ChatMessageDraft {
  if (typeof output !== "object" || output === null) return false;
  const record = output as Record<string, unknown>;
  return (
    record.status === "awaiting-confirmation" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    typeof record.message === "string"
  );
}

function renderToolPart(part: unknown): ReactNode {
  const toolPart = part as ToolPartGuess;
  if (toolPart.state !== "output-available") return null;

  // v7 keeps the tool name in the part type ("tool-showProject"), not a field.
  const toolName = toolPart.type.slice("tool-".length);

  if (toolName === "showProject" && isProjectCardData(toolPart.output)) {
    return <ProjectToolCard key="tool-showProject" project={toolPart.output} />;
  }
  if (toolName === "sendMessageToPritam" && isMessageDraft(toolPart.output)) {
    return <ContactConfirmCard key="tool-sendMessageToPritam" draft={toolPart.output} />;
  }
  return null;
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

  const [announcement, setAnnouncement] = useState("");
  
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant") {
        setAnnouncement(messageText(last));
      }
    } else if (status === "error") {
      setAnnouncement("An error occurred while generating the response.");
    }
  }, [status, messages]);

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
      className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ask about Pritam’s experience, projects, skills, or availability.
        </p>
      ) : null}

      {messages.map((message) => {
        const isUser = message.role === "user";
        const nodes = message.parts.flatMap((part, index) => {
          if (part.type === "text") {
            const text = part.text;
            if (!text.trim()) return [];
            return [
              <div key={`text-${index}`} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
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
              </div>,
            ];
          }
          if (part.type.startsWith("tool-")) {
            const card = renderToolPart(part);
            return card ? [<div key={`tool-${index}`} className="w-full">{card}</div>] : [];
          }
          return [];
        });

        if (nodes.length === 0) return null;

        return (
          <div key={message.id} className="flex flex-col gap-2">
            {nodes}
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
