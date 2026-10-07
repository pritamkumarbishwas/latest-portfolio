import Link from "next/link";
import { site } from "@/config/site";
import { contactTeaser } from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function ContactTeaser() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t border-border"
    >
      <Container className="py-20 md:py-28">
        <SectionHeading id="contact-heading" label={contactTeaser.label}>
          Let’s work <span className="font-serif italic">together</span>
        </SectionHeading>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {contactTeaser.body}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href={`mailto:${site.email}`} className={buttonVariants()}>
            {site.cta.label}
          </Link>
          <a
            href={`mailto:${site.email}`}
            className="text-sm text-muted-foreground transition-colors hover:text-accent-text"
          >
            {site.email}
          </a>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground transition-colors hover:text-accent-text"
          >
            Or use the contact form →
          </Link>
        </div>
      </Container>
    </section>
  );
}
