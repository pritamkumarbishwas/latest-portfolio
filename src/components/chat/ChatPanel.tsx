"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { RotateCcw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import knowledge from "@/content/chatbot-knowledge.json";
import { MAX_CHAT_MESSAGES, MAX_CHAT_MESSAGE_LENGTH } from "@/lib/chat/limits";

import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";
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
    <div className="fixed inset-0 z-[60] sm:flex sm:items-end sm:justify-end">
      <button
        type="button"
        aria-label="Close chat"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 sm:hidden"
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="relative flex h-dvh w-full flex-col overflow-hidden border border-border bg-card text-card-foreground shadow-lg motion-safe:animate-[reveal-up_0.25s_ease-out_both] sm:mb-24 sm:mr-4 sm:h-auto sm:max-h-[min(36rem,calc(100dvh-7rem))] sm:w-[24rem] sm:rounded-xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h2 id={TITLE_ID} className="font-display text-sm font-semibold">
              {knowledge.persona.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              AI assistant. Answers may be imperfect.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              disabled={messages.length === 0}
              aria-label="Clear conversation"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <MessageList messages={messages} status={status} />

        {messages.length === 0 ? (
          <SuggestionChips onPick={handleSend} />
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground"
          >
            <span>{friendlyErrorMessage(error.message)}</span>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1 font-medium text-accent-text hover:underline"
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
      </div>
    </div>
  );
}
