import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/schemas";

function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`contact:${clientIp(request)}`);
  if (rate.limited) {
    const minutes = Math.max(1, Math.ceil(rate.retryAfterSeconds / 60));
    return NextResponse.json(
      {
        ok: false,
        error: `Too many messages from this network — try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const record: Record<string, unknown> =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  if (typeof record.website === "string" && record.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Please fix the highlighted fields.",
        fields,
      },
      { status: 422 },
    );
  }

  const { name, email, message } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email delivery isn’t configured on the server yet — please use the direct email link below.",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
    to: [to],
    replyTo: email,
    subject: `Portfolio contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });

  if (error) {
    console.error("[contact] resend failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Couldn’t send your message right now — please try again or use the direct email link.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
