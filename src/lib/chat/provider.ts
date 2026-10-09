import "server-only";

import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type ChatProviderName = "groq" | "openai";

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

function requireModel(): string {
  const model = process.env.CHAT_MODEL?.trim();
  if (!model) {
    throw new ChatConfigError(
      "CHAT_MODEL is not set (e.g. openai/gpt-oss-20b on groq, gpt-4o-mini on openai)",
    );
  }
  return model;
}

/** Chat model id comes from CHAT_MODEL — no hardcoded defaults in code. */
export function getChatModel(): LanguageModel {
  const model = requireModel();

  switch (resolveProviderName()) {
    case "openai":
      return createOpenAI({ apiKey: requireEnv("OPENAI_API_KEY") })(model);
    case "groq":
      return createGroq({ apiKey: requireEnv("GROQ_API_KEY") })(model);
  }
}
