"use client";

import knowledge from "@/content/chatbot-knowledge.json";

export type SuggestionChipsProps = {
  onPick: (question: string) => void;
};

export function SuggestionChips({ onPick }: SuggestionChipsProps) {
  return (
    <div
      role="group"
      aria-label="Suggested questions"
      className="flex flex-wrap gap-2 px-4 pb-3"
    >
      {knowledge.suggestedQuestions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onPick(question)}
          className="rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted-foreground transition-[color,border-color] duration-200 hover:border-accent-text hover:text-accent-text"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
