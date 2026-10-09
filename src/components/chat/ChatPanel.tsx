"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { CircleAlert, Download, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";

import knowledge from "@/content/chatbot-knowledge.json";
import { getFollowUps } from "@/lib/chat/followups";
import { MAX_CHAT_MESSAGES, MAX_CHAT_MESSAGE_LENGTH } from "@/lib/chat/limits";

import { ChatInput } from "./ChatInput";
import { MessageList, messageText } from "./MessageList";
import { SuggestionChips } from "./SuggestionChips";

const STORAGE_KEY = "portfolio-chat-v1";
const STORED_MESSAGE_LIMIT = 20;
const TITLE_ID = "chat-panel-title";

function loadStoredMessages(): UIMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is UIMessage =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as { id?: unknown }).id === "string" &&
          ((item as { role?: unknown }).role === "user" ||
            (item as { role?: unknown }).role === "assistant") &&
          Array.isArray((item as { parts?: unknown }).parts),
      )
      .slice(-STORED_MESSAGE_LIMIT);
  } catch {
    return [];
  }
}

function persistMessages(messages: UIMessage[]): void {
  try {
    if (messages.length === 0) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-STORED_MESSAGE_LIMIT)),
    );
  } catch {
    // Storage may be full or blocked — chat still works without persistence.
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Non-2xx responses surface as the raw body string. Unwrap our
 * { ok: false, error } JSON so the banner shows a friendly message.
 */
function friendlyErrorMessage(raw: string): string {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { error?: unknown }).error === "string"
    ) {
      const message = (parsed as { error: string }).error;
      if (message) return message;
    }
  } catch {
    // Not JSON — plain-text stream error, fall through.
  }
  return raw || GENERIC_ERROR_MESSAGE;
}

export type ChatPanelProps = {
  onClose: () => void;
};

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [initialMessages] = useState<UIMessage[]>(loadStoredMessages);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { messages: messages.slice(-MAX_CHAT_MESSAGES) },
        }),
      }),
    [],
  );

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    regenerate,
    setMessages,
    clearError,
  } = useChat({
    id: "portfolio-chat",
    transport,
    messages: initialMessages,
  });

  useEffect(() => {
    persistMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (error) {
      if (error.message.includes("429") || error.message.includes("wait a moment")) {
        track("chat_rate_limited");
      } else {
        track("chat_error");
      }
    }
  }, [error]);

  const followUps = useMemo(() => {
    if (status !== "ready" || messages.length === 0) return [];
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return [];
    const asked = messages
      .filter((message) => message.role === "user")
      .map(messageText);
    return getFollowUps(messages.map(messageText).join("\n"), asked);
  }, [messages, status]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (!(active instanceof Node && dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  const handleSend = useCallback(
    (text: string) => {
      clearError();
      void sendMessage({ text });
    },
    [clearError, sendMessage],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    clearError();
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [clearError, setMessages]);

  const handleRetry = useCallback(() => {
    clearError();
    void regenerate();
  }, [clearError, regenerate]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 bg-background/55 backdrop-blur-sm motion-safe:animate-[reveal-fade_0.2s_ease-out_both]"
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="absolute inset-0 flex flex-col overflow-hidden bg-card text-card-foreground shadow-2xl motion-safe:animate-[panel-in_0.28s_cubic-bezier(0.22,1,0.36,1)_both] sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(80dvh,44rem)] sm:max-h-[calc(100dvh-7rem)] sm:w-[min(30rem,calc(100vw-3rem))] sm:rounded-3xl sm:border sm:border-border sm:bg-card/95 sm:backdrop-blur-xl sm:shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:pt-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-lg text-accent-foreground shadow-sm ring-1 ring-accent/30"
              aria-hidden="true"
            >
              <span>✨</span>
              <span
                className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card"
                title="Online"
              />
            </div>
            <div className="min-w-0">
              <h2
                id={TITLE_ID}
                className="truncate font-display text-sm font-semibold leading-none"
              >
                {knowledge.persona.name}
              </h2>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                Online · AI answers may be imperfect
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href="/resume.pdf"
              download
              aria-label="Download resume"
              title="Download resume"
              className="inline-flex size-11 items-center justify-center gap-1.5 rounded-full border border-border bg-muted/50 text-accent-text transition-colors hover:border-accent-text/50 hover:bg-accent/10 sm:h-9 sm:w-auto sm:px-3"
            >
              <Download className="size-4 shrink-0" aria-hidden="true" />
              <span className="hidden text-xs font-medium sm:inline">Resume</span>
            </a>
            <button
              type="button"
              onClick={handleClear}
              disabled={messages.length === 0}
              aria-label="Clear conversation"
              title="Clear conversation"
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 sm:size-9"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              title="Close chat"
              className="inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-9"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <MessageList messages={messages} status={status} />

        {messages.length === 0 ? (
          <SuggestionChips onPick={handleSend} />
        ) : status === "ready" && followUps.length > 0 ? (
          <SuggestionChips
            onPick={handleSend}
            questions={followUps}
            ariaLabel="Follow-up suggestions"
          />
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mx-4 mb-2 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs motion-safe:animate-[message-in_0.2s_ease-out_both]"
          >
            <span className="flex items-start gap-2 text-muted-foreground">
              <CircleAlert
                className="mt-0.5 size-3.5 shrink-0 text-red-500 dark:text-red-400"
                aria-hidden="true"
              />
              <span>{friendlyErrorMessage(error.message)}</span>
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 font-medium text-red-600 transition-colors hover:bg-red-500/15 dark:text-red-400"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : null}

        <ChatInput
          onSend={handleSend}
          onStop={stop}
          busy={busy}
          maxLength={MAX_CHAT_MESSAGE_LENGTH}
        />
        <div className="flex items-center justify-center gap-1.5 bg-muted/40 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center text-[10px] text-muted-foreground">
          <ShieldCheck className="size-3 shrink-0" aria-hidden="true" />
          <span>Messages are sent to an AI provider. Please do not enter sensitive info.</span>
        </div>
      </div>
    </div>
  );
}
