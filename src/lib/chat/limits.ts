/** Shared chat limits — imported by both the server schemas and the client UI. */
export const MAX_CHAT_MESSAGES = 10;
export const MAX_CHAT_MESSAGE_LENGTH = 500;

/** Cap for the entire request body, rejected before JSON parsing (server-only). */
export const MAX_CHAT_BODY_LENGTH = 32 * 1024;

