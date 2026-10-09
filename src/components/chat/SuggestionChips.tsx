"use client";

import { ArrowRight, Download } from "lucide-react";
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
      className="no-scrollbar flex w-full snap-x gap-2 overflow-x-auto px-4 pb-3"
    >
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => {
            track("chat_suggestion_clicked");
            onPick(question);
          }}
          className="group flex min-h-11 max-w-[15rem] shrink-0 snap-start items-center gap-2.5 rounded-full border border-border bg-muted/50 px-4 py-2.5 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-accent-text/50 hover:bg-muted hover:text-foreground hover:shadow-sm"
        >
          <span className="line-clamp-2 whitespace-normal leading-snug">
            {question}
          </span>
          <ArrowRight
            className="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
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
        className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-full border border-accent-text/30 bg-accent/5 px-4 py-2.5 text-sm font-medium text-accent-text transition-all duration-200 hover:border-accent-text/60 hover:bg-accent/10 hover:shadow-sm"
      >
        <span className="flex flex-1 items-center gap-2 whitespace-normal leading-snug">
          <Download className="size-4" aria-hidden="true" />
          Download resume
        </span>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 transition-transform duration-200 group-hover:scale-110">
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </div>
      </a>
    </div>
  );
}
