import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters)")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .pipe(z.email({ message: "Enter a valid email address" })),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
  website: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
