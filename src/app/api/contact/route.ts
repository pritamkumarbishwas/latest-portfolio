import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/schemas";

function clientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

type SendEmailParams = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  replyTo?: { email: string; name?: string };
};

async function sendEmail({ to, toName, subject, html, replyTo }: SendEmailParams) {
  const payload: any = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || "Portfolio Contact Form",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to, name: toName }],
    subject,
    htmlContent: html,
  };

  if (replyTo) {
    payload.replyTo = replyTo;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Brevo error ${res.status}: ${error}`);
  }

  return res.json();
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

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  
  if (!apiKey || !to || !senderEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email delivery isn’t configured on the server yet — please use the direct email link below.",
      },
      { status: 503 },
    );
  }

  try {
    await sendEmail({
      to,
      subject: `Portfolio contact from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br/>')}</p>`,
      replyTo: { email, name },
    });
  } catch (error) {
    console.error("[contact] brevo failed:", error);
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
