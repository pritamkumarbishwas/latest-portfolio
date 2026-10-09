import type { z } from "zod";

import type {
  chatbotKnowledgeSchema,
  chatRequestSchema,
  chatUiMessageSchema,
  portfolioSchema,
} from "@/lib/chat/schemas";

/** Validated portfolio content (src/content/profile.json). */
export type Portfolio = z.infer<typeof portfolioSchema>;

/** Validated chatbot configuration (src/content/chatbot-knowledge.json). */
export type ChatbotKnowledge = z.infer<typeof chatbotKnowledgeSchema>;

/** Who sent a chat message. */
export type ChatRole = z.infer<typeof chatUiMessageSchema>["role"];

/** A chat UI message as validated on the server (text parts only). */
export type ChatUiMessage = z.infer<typeof chatUiMessageSchema>;

/** Validated POST body for /api/chat. */
export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Payload the showProject tool renders as a card inside the chat. */
export type ChatProjectCardData = {
  slug: string;
  title: string;
  summary: string;
  cover: string | null;
  period: string | null;
  liveUrl: string | null;
  techStack: string[];
};

/** Payload the sendMessageToPritam tool returns — a draft awaiting explicit confirmation. */
export type ChatMessageDraft = {
  status: "awaiting-confirmation";
  name: string;
  email: string;
  message: string;
};
