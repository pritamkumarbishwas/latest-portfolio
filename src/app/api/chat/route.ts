import {
  createUIMessageStreamResponse,
  isStepCount,
  type ModelMessage,
  streamText,
  StreamProviderError,
  toUIMessageStream,
} from "ai";
import { NextResponse } from "next/server";

import { isChatEnabled, isTrustedRequest } from "@/lib/chat/guard";
import { MAX_CHAT_BODY_LENGTH } from "@/lib/chat/limits";
import { getChatModel } from "@/lib/chat/provider";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import { checkChatRateLimit, getClientIp } from "@/lib/chat/ratelimit";
import { chatRequestSchema } from "@/lib/chat/schemas";
import { sendMessageToPritam, showProject } from "@/lib/chat/tools";

export const runtime = "nodejs";
export const maxDuration = 30;

const CHAT_TEMPERATURE = 0.3;
const CHAT_MAX_OUTPUT_TOKENS = 400;

const DISABLED_MESSAGE =
  "The chat assistant is switched off right now — please use the contact form or email instead.";
const RATE_LIMITED_MESSAGE =
  "That’s a lot of questions in a row — please wait a moment and try again.";
const UNAVAILABLE_MESSAGE =
  "The assistant is temporarily unavailable — please try again in a moment.";
const STREAM_ERROR_MESSAGE =
  "Something went wrong while writing a reply. Please try again.";

function errorResponse(status: number, message: string, headers?: HeadersInit) {
  return NextResponse.json({ ok: false, error: message }, { status, headers });
}

export async function POST(request: Request) {
  if (!isChatEnabled()) {
    return errorResponse(503, DISABLED_MESSAGE);
  }

  if (!isTrustedRequest(request)) {
    return errorResponse(403, "Requests from this origin are not allowed.");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_CHAT_BODY_LENGTH) {
    return errorResponse(400, "Request body is too large.");
  }

  let rate;
  try {
    rate = await checkChatRateLimit(getClientIp(request));
  } catch (error) {
    console.error(
      "[chat] rate limiter unavailable:",
      error instanceof Error ? error.message : "unknown",
    );
    return errorResponse(503, UNAVAILABLE_MESSAGE);
  }

  if (rate.limited) {
    const retryAfter = Math.min(Math.max(1, rate.retryAfterSeconds), 86_400);
    return errorResponse(429, RATE_LIMITED_MESSAGE, {
      "Retry-After": String(retryAfter),
    });
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return errorResponse(400, "Could not read the request body.");
  }

  if (raw.length > MAX_CHAT_BODY_LENGTH) {
    return errorResponse(400, "Request body is too large.");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorResponse(400, "Request body must be valid JSON.");
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const detail = issue
      ? `${issue.path.join(".") || "body"}: ${issue.message}`
      : "Invalid chat request.";
    return errorResponse(400, detail);
  }

  let model;
  try {
    model = getChatModel();
  } catch (error) {
    console.error(
      "[chat] provider configuration error:",
      error instanceof Error ? error.message : "unknown",
    );
    return errorResponse(
      500,
      "The assistant isn’t configured on the server yet — please use the contact form or email instead.",
    );
  }

  const messages: ModelMessage[] = parsed.data.messages.map((message) => ({
    role: message.role,
    content: message.parts.map((part) => part.text).join(""),
  }));

  try {
    const result = streamText({
      model,
      instructions: buildSystemPrompt(),
      messages,
      temperature: CHAT_TEMPERATURE,
      maxOutputTokens: CHAT_MAX_OUTPUT_TOKENS,
      tools: { showProject, sendMessageToPritam },
      stopWhen: isStepCount(4),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          if (
            StreamProviderError.isInstance(error) &&
            error.statusCode === 429
          ) {
            return RATE_LIMITED_MESSAGE;
          }
          // Log the error class only — never message content or the prompt.
          const label = StreamProviderError.isInstance(error)
            ? `provider error (status ${error.statusCode ?? "unknown"})`
            : error instanceof Error
              ? error.name
              : "unknown";
          console.error(`[chat] stream error: ${label}`);
          return STREAM_ERROR_MESSAGE;
        },
      }),
    });
  } catch (error) {
    console.error(
      "[chat] failed to start stream:",
      error instanceof Error ? error.name : "unknown",
    );
    return errorResponse(
      500,
      "The assistant is unavailable right now — please try again later or use the contact form.",
    );
  }
}
