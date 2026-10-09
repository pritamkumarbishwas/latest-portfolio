import "server-only";

import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type ChatProviderName = "groq" | "openai";

const GROQ_MODEL_ID = "openai/gpt-oss-120b";
const OPENAI_MODEL_ID = "gpt-4o-mini";

/** Server configuration is missing or invalid. Never sent to the client. */
export class ChatConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatConfigError";
  }
}

function resolveProviderName(): ChatProviderName {
  const raw = process.env.CHAT_PROVIDER?.trim().toLowerCase();
  if (!raw || raw === "groq") return "groq";
  if (raw === "openai") return "openai";
  throw new ChatConfigError(
    `Unsupported CHAT_PROVIDER "${raw}" (expected "groq" or "openai")`,
  );
}

function requireEnv(name: "GROQ_API_KEY" | "OPENAI_API_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new ChatConfigError(`${name} is not set`);
  }
  return value;
}

/** Chat model: CHAT_MODEL env override, else the provider default. */
export function getChatModel(): LanguageModel {
  const model = process.env.CHAT_MODEL?.trim() || undefined;

  switch (resolveProviderName()) {
    case "openai":
      return createOpenAI({ apiKey: requireEnv("OPENAI_API_KEY") })(
        model ?? OPENAI_MODEL_ID,
      );
    case "groq":
      return createGroq({ apiKey: requireEnv("GROQ_API_KEY") })(
        model ?? GROQ_MODEL_ID,
      );
  }
}
