import type { Metadata } from "next";
import Image from "next/image";
import { Download } from "lucide-react";
import { site } from "@/config/site";
import { aboutPage, achievements, certifications, education, skills } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TagList } from "@/components/ui/tag-list";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: `The story, values, and skills behind ${site.name}’s full-stack work.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <section aria-labelledby="about-page-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading as="h1" id="about-page-heading" label="About">
          The story behind <span className="font-serif italic">the work</span>
        </SectionHeading>

        <div className="mt-12 grid gap-10 md:grid-cols-[18rem_1fr] md:gap-14">
          <Image
            src={aboutPage.photo.src}
            alt={aboutPage.photo.alt}
            width={800}
            height={800}
            preload
            sizes="(max-width: 768px) 60vw, 288px"
            className="aspect-square w-full max-w-64 rounded-xl border border-border object-cover md:max-w-none"
          />

          <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {aboutPage.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <SectionHeading id="values-heading" label="Values">
            How I <span className="font-serif italic">work</span>
          </SectionHeading>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {aboutPage.values.map((value) => (
            <Card key={value.title}>
              <h3 className="font-display tracking-tight">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.body}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading id="skills-heading" label="Skills">
            The <span className="font-serif italic">toolkit</span>
          </SectionHeading>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {group.category}
              </h3>
              <div className="mt-3">
                <TagList items={group.skills} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading id="certifications-heading" label="Certifications">
            Courses I’ve <span className="font-serif italic">completed</span>
          </SectionHeading>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {certifications.map((cert) => (
            <Card key={cert.title}>
              <h3 className="font-display tracking-tight">{cert.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {[cert.platform, `Issued by ${cert.issuer}`, cert.date].join(
                  " · ",
                )}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {cert.description}
              </p>
              {cert.url ? (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-accent-text underline-offset-4 hover:underline"
                >
                  Verify certificate
                </a>
              ) : null}
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading id="education-heading" label="Education">
            Where I <span className="font-serif italic">studied</span>
          </SectionHeading>
        </div>
        <div className="mt-8 max-w-2xl">
          {education.map((item) => (
            <Card key={item.institution}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display tracking-tight">
                  {item.institution}
                </h3>
                <p className="text-sm text-muted-foreground">{item.period}</p>
              </div>
              <p className="mt-2 text-sm font-medium">{item.degree}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[item.detail, item.location].filter(Boolean).join(" · ")}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading id="achievements-heading" label="Achievements">
            Problem <span className="font-serif italic">solving</span>
          </SectionHeading>
        </div>
        <ul className="mt-8 max-w-2xl space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          {achievements.map((achievement) => (
            <li key={achievement.text} className="flex gap-3">
              <span aria-hidden="true" className="text-accent-text">
                →
              </span>
              {achievement.href ? (
                <a
                  href={achievement.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 transition-colors hover:text-accent-text hover:underline"
                >
                  {achievement.text}
                  <span className="sr-only"> (opens in new tab)</span>
                </a>
              ) : (
                <span>{achievement.text}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-wrap items-center gap-4 border-t border-border pt-8">
          <a href="/resume.pdf" download className={buttonVariants()}>
            <Download className="size-4" aria-hidden="true" />
            Download resume
          </a>
          <p className="text-sm text-muted-foreground">
            PDF · one page, updated regularly.
          </p>
        </div>
      </Container>
    </section>
  );
}
