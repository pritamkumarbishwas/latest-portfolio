import { experience } from "@/lib/data";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading id="experience-heading" label="Experience">
          Where I’ve <span className="font-serif italic">worked</span>
        </SectionHeading>

        <ol className="relative mt-12 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-border before:content-['']">
          {experience.map((item) => (
            <li key={item.company} className="relative pb-10 pl-8 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 size-2.5 -translate-x-1/2 rounded-full bg-accent ring-4 ring-background"
              />

              <p className="text-sm text-muted-foreground">{item.period}</p>
              <h3 className="mt-1 font-display tracking-tight">{item.role}</h3>
              <p className="mt-1 text-sm font-medium text-accent-text">
                {item.company}
              </p>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.summary}
              </p>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent-text">
                      →
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
