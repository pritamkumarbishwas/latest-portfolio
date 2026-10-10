"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { site } from "@/config/site";
import type { ContactFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SubmitStatus = "idle" | "success" | "error";

let resolverPromise: Promise<Resolver<ContactFormValues>> | null = null;

function loadResolver(): Promise<Resolver<ContactFormValues>> {
  resolverPromise ??= Promise.all([
    import("@hookform/resolvers/zod"),
    import("@/lib/schemas"),
  ]).then(
    ([{ zodResolver }, { contactFormSchema }]) =>
      zodResolver(contactFormSchema),
  );
  return resolverPromise;
}

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: (values, context, options) =>
      loadResolver().then((resolve) => resolve(values, context, options)),
    defaultValues: { name: "", email: "", message: "", website: "" },
    shouldFocusError: true,
  });

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data: {
        ok?: boolean;
        error?: string;
        fields?: Record<string, string>;
      } = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422 && data.fields) {
          for (const [field, message] of Object.entries(data.fields)) {
            if (field === "name" || field === "email" || field === "message") {
              setError(field, { type: "server", message });
            }
          }
        }
        setServerError(
          data.error ?? "Something went wrong — please try again.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setServerError(
        "Network error — please try again, or email me directly below.",
      );
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={() => void loadResolver()}
      noValidate
      className="space-y-6"
    >
      <div role="status" aria-live="polite" aria-atomic="true">
        {status === "success" ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-foreground">
            Thanks — your message is on its way. I’ll get back to you within a
            day.
          </p>
        ) : null}
        {status === "error" && serverError ? (
          <p className="rounded-xl border border-accent-text bg-card p-4 text-sm text-foreground">
            {serverError}{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-accent-text underline-offset-4 hover:underline"
            >
              Email me directly
            </a>
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium">
            Name
          </label>
          <Input
            id="contact-name"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            required
            className="mt-2"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          {errors.name ? (
            <p id="contact-name-error" className="mt-1.5 text-sm text-accent-text">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium">
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            required
            className="mt-2"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p
              id="contact-email-error"
              className="mt-1.5 text-sm text-accent-text"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium"
        >
          Message
        </label>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder="Please share details about your project or the role you are hiring for..."
          required
          className="mt-2"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
          {...register("message")}
        />
        {errors.message ? (
          <p
            id="contact-message-error"
            className="mt-1.5 text-sm text-accent-text"
          >
            {errors.message.message}
          </p>
        ) : null}
      </div>

      <div aria-hidden="true" className="sr-only">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
        <a
          href={`mailto:${site.email}`}
          className="text-sm text-muted-foreground transition-colors hover:text-accent-text"
        >
          or email {site.email}
        </a>
      </div>
    </form>
  );
}
