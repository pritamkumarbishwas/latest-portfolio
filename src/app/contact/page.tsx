import type { Metadata } from "next";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/contact-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Get in touch — tell me about your project and I’ll reply within a day.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section aria-labelledby="contact-page-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading as="h1" id="contact-page-heading" label="Contact">
          Let’s <span className="font-serif italic">talk</span>
        </SectionHeading>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Fill in the form or email me directly at{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-accent-text underline-offset-4 hover:underline"
          >
            {site.email}
          </a>{" "}
          — either way, I reply within a day.
        </p>

        <div className="mt-10 max-w-2xl">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
