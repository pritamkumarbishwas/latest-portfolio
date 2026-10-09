import "server-only";

import { tool } from "ai";
import { z } from "zod";

import type { ChatMessageDraft, ChatProjectCardData } from "@/types/chat";

import { portfolio } from "./schemas";

const projectSlugs = [...new Set(portfolio.projects.map((project) => project.slug))];

/** Render a project card in the chat. Slug is validated against profile.json. */
export const showProject = tool({
  description:
    "Display a project card (cover image, period, summary, tech tags, live link) in the chat. " +
    "Use when the visitor asks about a specific project. Available slugs: " +
    projectSlugs.join(", "),
  inputSchema: z.object({
    slug: z.enum(projectSlugs as [string, ...string[]]),
  }),
  execute: async ({ slug }): Promise<ChatProjectCardData | { error: string }> => {
    const project = portfolio.projects.find((item) => item.slug === slug);
    if (!project) return { error: `Unknown project slug "${slug}"` };

    return {
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      cover: project.cover ?? null,
      period: project.period ?? null,
      liveUrl: project.liveUrl ?? null,
      techStack: project.techStack.slice(0, 8),
    };
  },
});

/**
 * Prepares a message draft for Pritam. Never sends anything: the output is a
 * confirmation card, and the actual send happens only when the visitor clicks
 * Send (client POSTs to /api/contact — same schema, honeypot, rate limit).
 */
export const sendMessageToPritam = tool({
  description:
    "Prepare a message for Pritam from the visitor. Collect name, email, and message in short " +
    "conversation turns first, then show the full message and ask for explicit confirmation. " +
    "Call this tool ONLY after the visitor clearly confirms sending. The tool never emails by " +
    "itself — it returns a confirmation card the visitor must approve.",
  inputSchema: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    email: z.string().trim().pipe(z.email({ message: "Enter a valid email address" })),
    message: z
      .string()
      .trim()
      .min(10, "Message must be at least 10 characters")
      .max(2000),
    confirmed: z
      .literal(true)
      .describe(
        "Must be true. Set it only after the visitor explicitly confirmed the exact message.",
      ),
  }),
  execute: async ({ name, email, message }): Promise<ChatMessageDraft> => ({
    status: "awaiting-confirmation",
    name,
    email,
    message,
  }),
});
