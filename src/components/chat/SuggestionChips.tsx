"use client";

import { Download } from "lucide-react";
import { track } from "@vercel/analytics";

import knowledge from "@/content/chatbot-knowledge.json";

export type SuggestionChipsProps = {
  onPick: (question: string) => void;
  /** Defaults to the static suggested questions from chatbot-knowledge.json. */
  questions?: string[];
  ariaLabel?: string;
};

export function SuggestionChips({
  onPick,
  questions = knowledge.suggestedQuestions,
  ariaLabel = "Suggested questions",
}: SuggestionChipsProps) {
  if (questions.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 px-4 pb-3"
    >
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => {
            track("chat_suggestion_clicked");
            onPick(question);
          }}
          className="min-h-[44px] rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted-foreground transition-[color,border-color] duration-200 hover:border-accent-text hover:text-accent-text"
        >
          {question}
        </button>
      ))}
    </div>
  );
}

/** Quick action: download Pritam's resume (static file, no server round-trip). */
export function ResumeQuickAction() {
  return (
    <div className="px-4 pb-3">
      <a
        href="/resume.pdf"
        download
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-accent-text/60 px-3 py-1.5 text-xs font-medium text-accent-text transition-[color,border-color] duration-200 hover:border-accent-text"
      >
        <Download className="size-3.5" aria-hidden="true" />
        Download resume
      </a>
    </div>
  );
}
