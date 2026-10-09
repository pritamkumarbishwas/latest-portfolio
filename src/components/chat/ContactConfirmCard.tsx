"use client";

import { Check, Loader2, Send, X } from "lucide-react";
import { useState } from "react";

import type { ChatMessageDraft } from "@/types/chat";

type SendStatus = "idle" | "sending" | "sent" | "error";

/**
 * Confirmation card for the sendMessageToPritam tool. Nothing leaves the
 * browser until the visitor clicks "Send" — the POST reuses /api/contact
 * (same zod schema, honeypot, and rate limit as the contact form).
 */
export function ContactConfirmCard({ draft }: { draft: ChatMessageDraft }) {
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [discarded, setDiscarded] = useState(false);

  const handleSend = async () => {
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          email: draft.email,
          message: draft.message,
          website: "",
        }),
      });
      const data: unknown = await response.json().catch(() => null);
      const serverError =
        typeof data === "object" &&
        data !== null &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : null;

      if (response.ok) {
        setStatus("sent");
        return;
      }
      setStatus("error");
      setError(
        serverError ??
          (response.status === 429
            ? "Too many messages — please try again in a few minutes."
            : "Couldn’t send your message right now — please use the contact form instead."),
      );
    } catch {
      setStatus("error");
      setError("Network error — please try again or use the contact form.");
    }
  };

  if (discarded) {
    return (
      <p className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
        Message discarded — nothing was sent.
      </p>
    );
  }

  return (
    <section
      aria-label="Message for Pritam — awaiting your confirmation"
      className="w-full rounded-xl border border-border bg-card p-3.5"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Message for Pritam
      </h3>

      <dl className="mt-2 space-y-1.5 text-xs">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-muted-foreground">Name</dt>
          <dd className="break-words text-foreground">{draft.name}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-muted-foreground">Email</dt>
          <dd className="break-all text-foreground">{draft.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-muted-foreground">Message</dt>
          <dd className="whitespace-pre-wrap break-words text-foreground">
            {draft.message}
          </dd>
        </div>
      </dl>

      {status === "sent" ? (
        <p
          role="status"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-text"
        >
          <Check className="size-3.5" aria-hidden="true" />
          Sent to Pritam — he’ll reply to {draft.email}.
        </p>
      ) : (
        <>
          {status === "error" && error ? (
            <p role="alert" className="mt-3 text-xs text-accent-text">
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={status === "sending"}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-accent-foreground transition-[transform,opacity] duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
            >
              {status === "sending" ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-3.5" aria-hidden="true" />
              )}
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            <button
              type="button"
              onClick={() => setDiscarded(true)}
              disabled={status === "sending"}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border-strong px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
            >
              <X className="size-3.5" aria-hidden="true" />
              Discard
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Nothing is sent until you press Send.
          </p>
        </>
      )}
    </section>
  );
}
