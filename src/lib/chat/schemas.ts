import "server-only";

import { z } from "zod";

import chatbotKnowledgeJson from "@/content/chatbot-knowledge.json";
import portfolioJson from "@/content/profile.json";

import {
  MAX_CHAT_MESSAGES,
  MAX_CHAT_MESSAGE_LENGTH,
} from "./limits";

export { MAX_CHAT_MESSAGES, MAX_CHAT_MESSAGE_LENGTH };

const linkSchema = z.strictObject({
  label: z.string().min(1),
  href: z.url(),
});

const contactSchema = z.strictObject({
  location: z.string().min(1),
  phone: z.string().min(1),
  email: z.email(),
  links: z.array(linkSchema).min(1),
});

const experienceSchema = z.strictObject({
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1).optional(),
  mode: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  techStack: z.array(z.string().min(1)).optional(),
  highlights: z.array(z.string().min(1)).min(1),
});

const projectSchema = z.strictObject({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  cover: z.string().min(1).optional(),
  period: z.string().min(1).optional(),
  liveUrl: z.url().optional(),
  links: z.array(linkSchema).optional(),
  techStack: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(1),
});

const skillGroupSchema = z.strictObject({
  category: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
});

const certificationSchema = z.strictObject({
  title: z.string().min(1),
  issuer: z.string().min(1),
  platform: z.string().min(1),
  date: z.string().min(1),
  url: z.url().optional(),
  description: z.string().min(1),
});

const educationSchema = z.strictObject({
  institution: z.string().min(1),
  period: z.string().min(1),
  degree: z.string().min(1),
  detail: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
});

const valueSchema = z.strictObject({
  title: z.string().min(1),
  body: z.string().min(1),
});

const achievementSchema = z.strictObject({
  text: z.string().min(1),
  href: z.url().optional(),
});

export const portfolioSchema = z.strictObject({
  name: z.string().min(1),
  role: z.string().min(1),
  contact: contactSchema,
  summary: z.string().min(1),
  summaryShort: z.string().min(1),
  experience: z.array(experienceSchema).min(1),
  projects: z.array(projectSchema).min(1),
  photo: z.strictObject({
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
  story: z.array(z.string().min(1)).min(1),
  values: z.array(valueSchema).min(1),
  skills: z.array(skillGroupSchema).min(1),
  certifications: z.array(certificationSchema).min(1),
  education: z.array(educationSchema).min(1),
  achievements: z.array(achievementSchema).min(1),
});

const personaSchema = z.strictObject({
  name: z.string().min(1),
  role: z.string().min(1),
  tone: z.string().min(1),
  greeting: z.string().min(1),
});

const rulesSchema = z.strictObject({
  dos: z.array(z.string().min(1)).min(1),
  donts: z.array(z.string().min(1)).min(1),
});

const availabilitySchema = z.strictObject({
  status: z.string().min(1),
  modes: z.array(z.string().min(1)).min(1),
  location: z.string().min(1),
  responseTime: z.string().min(1),
  note: z.string().min(1),
});

const faqItemSchema = z.strictObject({
  question: z.string().min(1),
  answer: z.string().min(1),
});

export const chatbotKnowledgeSchema = z.strictObject({
  persona: personaSchema,
  rules: rulesSchema,
  availability: availabilitySchema,
  unknowns: z.array(z.string().min(1)).min(1),
  faq: z.array(faqItemSchema).min(1),
  suggestedQuestions: z.array(z.string().min(1)).min(1),
  fallbackMessage: z.string().min(1),
});

const chatRoleSchema = z.enum(["user", "assistant"]);

const MAX_CHAT_MESSAGE_PARTS = 10;

/**
 * A single UI message as sent by `useChat`'s default transport: text parts
 * only, no client-supplied system role.
 */
export const chatUiMessageSchema = z
  .object({
    id: z.string().min(1).max(128),
    role: chatRoleSchema,
    parts: z
      .array(
        z.looseObject({
          type: z.literal("text"),
          text: z
            .string()
            .max(
              MAX_CHAT_MESSAGE_LENGTH,
              `Each part must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer`,
            ),
        }),
      )
      .min(1, "Message cannot be empty")
      .max(MAX_CHAT_MESSAGE_PARTS),
  })
  .superRefine((message, ctx) => {
    const total = message.parts.reduce(
      (sum, part) => sum + part.text.length,
      0,
    );
    if (total > MAX_CHAT_MESSAGE_LENGTH) {
      ctx.addIssue({
        code: "custom",
        message: `Message must be ${MAX_CHAT_MESSAGE_LENGTH} characters or fewer`,
      });
    }
  });

/** Validated POST body for /api/chat (extra fields like `trigger` are stripped). */
export const chatRequestSchema = z.object({
  messages: z
    .array(chatUiMessageSchema)
    .min(1, "At least one message is required")
    .max(
      MAX_CHAT_MESSAGES,
      `At most ${MAX_CHAT_MESSAGES} messages are allowed per request`,
    ),
});

/**
 * Validated portfolio content. Parsed at module load so malformed content
 * fails the build instead of surfacing at runtime.
 */
export const portfolio = portfolioSchema.parse(portfolioJson);

/** Validated chatbot configuration, parsed at module load. */
export const chatbotKnowledge =
  chatbotKnowledgeSchema.parse(chatbotKnowledgeJson);
