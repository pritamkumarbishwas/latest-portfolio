import type { Metadata } from "next";
import { site } from "@/config/site";
import { SOCIAL_LINKS } from "@/lib/constants";
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

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <dt className="sr-only">Phone</dt>
            <dd>
              <a
                href={`tel:${site.phone.replace(/-/g, "")}`}
                className="transition-colors hover:text-accent-text"
              >
                {site.phone}
              </a>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Location</dt>
            <dd>{site.location}</dd>
          </div>
        </dl>

        <nav aria-label="Social profiles" className="mt-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent-text"
                >
                  {social.label}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 max-w-2xl">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
