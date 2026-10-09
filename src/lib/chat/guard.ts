import "server-only";

/**
 * Request guards for /api/chat: the kill switch and the origin/host allowlist.
 *
 * Origin check = CSRF defence (only browsers on allowlisted origins may call).
 * Host check = who the request was addressed to (rejects odd Host headers).
 */

/** CHAT_ENABLED=false turns the route into a 503 and hides the launcher. */
export function isChatEnabled(): boolean {
  return process.env.CHAT_ENABLED !== "false";
}

function hostnameFromHostHeader(host: string | null): string | null {
  if (!host) return null;
  const value = host.trim().toLowerCase();
  if (!value) return null;
  if (value.startsWith("[")) {
    const end = value.indexOf("]");
    return end > 1 ? value.slice(1, end) : null;
  }
  const colon = value.indexOf(":");
  return colon === -1 ? value : value.slice(0, colon);
}

let warnedMissingSiteUrl = false;

function allowedHostnames(): Set<string> {
  const allowed = new Set(["localhost", "127.0.0.1", "::1"]);

  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).hostname.toLowerCase());
    } catch {
      console.error("[chat] SITE_URL is not a valid URL — only localhost can call /api/chat.");
    }
  } else if (process.env.NODE_ENV === "production" && !warnedMissingSiteUrl) {
    warnedMissingSiteUrl = true;
    console.warn(
      "[chat] SITE_URL is not set — /api/chat only accepts localhost. Set SITE_URL to your public origin (e.g. https://yourdomain.com).",
    );
  }

  return allowed;
}

/**
 * True when the request comes from localhost or the SITE_URL origin.
 * Requires a valid Host; when a browser sends an Origin, that must match too.
 */
export function isTrustedRequest(request: Request): boolean {
  const allowed = allowedHostnames();

  const host = hostnameFromHostHeader(request.headers.get("host"));
  if (!host || !allowed.has(host)) return false;

  const origin = request.headers.get("origin");
  if (origin === null) return true; // non-browser client (curl) — Host already validated
  if (origin === "null") return false; // sandboxed iframe

  try {
    return allowed.has(new URL(origin).hostname.toLowerCase());
  } catch {
    return false;
  }
}
