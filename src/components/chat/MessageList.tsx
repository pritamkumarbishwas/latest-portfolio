"use client";

import { Check, Copy } from "lucide-react";
import { track } from "@vercel/analytics";
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard
      .writeText(text)
      .then(() => {
        track("chat_message_copied");
        setCopied(true);
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Clipboard blocked (permissions/insecure context) — silently skip.
      });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy message"}
      title={copied ? "Copied" : "Copy message"}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] leading-none transition-opacity duration-150 hover:text-foreground focus-visible:opacity-100 [@media(pointer:coarse)]:opacity-100",
        "text-muted-foreground opacity-0 group-hover:opacity-100",
        copied && "text-emerald-600 opacity-100 dark:text-emerald-400",
      )}
    >
      {copied ? (
        <Check className="size-3" aria-hidden="true" />
      ) : (
        <Copy className="size-3" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

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

  let announcement = "";
  if (status === "ready" && messages.length > 0) {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      announcement = messageText(last);
    }
  } else if (status === "error") {
    announcement = "An error occurred while generating the response.";
  }

  const lastMessage = messages[messages.length - 1];
  const showTyping =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      messageText(lastMessage).length === 0);

  return (
    <>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="off"
        aria-label="Chat messages"
        className="flex flex-1 flex-col space-y-3 overflow-y-auto overscroll-contain px-4 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center motion-safe:animate-[reveal-up_0.3s_ease-out_both]">
            <div
              className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-hover text-3xl text-accent-foreground shadow-md ring-1 ring-accent/30"
              aria-hidden="true"
            >
              ✨
            </div>
            <div className="space-y-1.5">
              <p className="font-display text-base font-semibold text-foreground">
                Ask me about Pritam
              </p>
              <p className="mx-auto max-w-[17rem] text-sm text-muted-foreground">
                Experience, projects, skills, or availability — answered instantly
                from his portfolio.
              </p>
            </div>
          </div>
        ) : null}

        {messages.map((message, messageIndex) => {
          const isUser = message.role === "user";
          const showAssistantLabel =
            !isUser &&
            (messageIndex === 0 ||
              messages[messageIndex - 1]?.role !== "assistant");
          const fullText = messageText(message);

          const nodes = message.parts.flatMap((part, index) => {
            if (part.type === "text") {
              const text = part.text;
              if (!text.trim()) return [];
              return [
                <div
                  key={`text-${index}`}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      isUser
                        ? "rounded-br-md bg-accent text-accent-foreground shadow-sm"
                        : "rounded-bl-md border border-border/60 bg-muted text-foreground",
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
            <div
              key={message.id}
              className="group flex flex-col gap-2 motion-safe:animate-[message-in_0.25s_ease-out_both]"
            >
              {showAssistantLabel ? (
                <div className="flex items-center gap-2 pl-0.5 text-[11px] font-medium text-muted-foreground">
                  <span
                    className="flex size-5 items-center justify-center rounded-full bg-accent/10 text-[10px] ring-1 ring-accent/20"
                    aria-hidden="true"
                  >
                    ✨
                  </span>
                  Pritam&apos;s assistant
                </div>
              ) : null}
              {nodes}
              {!isUser && fullText.trim() ? (
                <div className="-mt-1 flex justify-end pr-1">
                  <CopyButton text={fullText} />
                </div>
              ) : null}
            </div>
          );
        })}

        {showTyping ? (
          <div className="flex justify-start motion-safe:animate-[message-in_0.2s_ease-out_both]">
            <div
              className="rounded-2xl rounded-bl-md border border-border/60 bg-muted px-4 py-3"
              aria-hidden="true"
            >
              <div className="flex items-center gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-accent [animation-delay:120ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-accent [animation-delay:240ms]" />
              </div>
              <span className="sr-only">Pritam’s assistant is typing…</span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
