"use client";

import { Suspense, lazy, useCallback, useRef } from "react";
import { track } from "@vercel/analytics";

import { useChatOpen } from "./ChatProvider";

const ChatPanel = lazy(() => import("./ChatPanel"));

export function ChatLauncher() {
  const { isOpen, openChat, closeChat } = useChatOpen();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const preloaded = useRef(false);

  const preload = useCallback(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    void import("./ChatPanel");
  }, []);

  const handleClose = useCallback(() => {
    closeChat();
    buttonRef.current?.focus();
  }, [closeChat]);

  return (
    <>
      <button
        ref={buttonRef}
        id="chat-launcher-button"
        type="button"
        onClick={() => {
          if (!isOpen) track("chat_opened");
          openChat();
        }}
        onMouseEnter={preload}
        onFocus={preload}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Chat with Pritam's AI assistant"
        className={`fixed bottom-5 right-5 z-50 inline-flex size-13 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-[transform,opacity] duration-200 hover:scale-105 active:scale-95 ${
          isOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-6"
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
      </button>
      {isOpen ? (
        <Suspense fallback={null}>
          <ChatPanel onClose={handleClose} />
        </Suspense>
      ) : null}
    </>
  );
}
