import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/schemas";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type BrevoConfig = {
  apiKey: string;
  senderEmail: string;
  senderName: string;
};

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  replyTo?: { email: string; name?: string };
};

async function sendEmail(
  config: BrevoConfig,
  { to, subject, html, replyTo }: SendEmailParams,
) {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: config.apiKey, // using the API key or SMTP key provided
    },
  });

  await transporter.sendMail({
    from: `"${config.senderName}" <${config.senderEmail}>`,
    to,
    replyTo: replyTo ? `"${replyTo.name || ''}" <${replyTo.email}>` : undefined,
    subject,
    html,
  });

  return { messageId: "nodemailer-sent" };
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

  // Honeypot: bots fill this hidden field
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
      { ok: false, error: "Please fix the highlighted fields.", fields },
      { status: 422 },
    );
  }

  const { name, email, message } = parsed.data;

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  console.log("apiKey==========", apiKey)
  console.log("senderEmail==========", senderEmail)
  console.log("to==========", to)

  if (!apiKey || !to || !senderEmail) {
    console.error("[contact] missing env: BREVO_API_KEY / BREVO_SENDER_EMAIL / CONTACT_TO_EMAIL");
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email delivery isn’t configured on the server yet — please use the direct email link below.",
      },
      { status: 503 },
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br/>");
  const subjectName = name.replace(/[\r\n]+/g, " ").slice(0, 80);

  // try {
  await sendEmail(
    {
      apiKey,
      senderEmail,
      senderName: process.env.BREVO_SENDER_NAME || "Portfolio Contact Form",
    },
    {
      to,
      subject: `Portfolio contact from ${subjectName}`,
      html: `<p><strong>Name:</strong> ${safeName}</p>
               <p><strong>Email:</strong> ${safeEmail}</p>
               <p><strong>Message:</strong></p>
               <p>${safeMessage}</p>`,
      replyTo: { email, name: subjectName },
    },
  );
  // } catch (error) {
  //   console.error("[contact] brevo failed:", error);
  //   return NextResponse.json(
  //     {
  //       ok: false,
  //       error:
  //         "Couldn’t send your message right now — please try again or use the direct email link.",
  //     },
  //     { status: 502 },
  //   );
  // }

  return NextResponse.json({ ok: true });
}