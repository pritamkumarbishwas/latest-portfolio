import { aboutPreview } from "@/lib/data";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { TagList } from "@/components/ui/tag-list";

export function AboutPreview() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-border bg-card"
    >
      <Container className="py-20 md:py-28">
        <SectionHeading id="about-heading" label="About">
          A bit about <span className="font-serif italic">me</span>
        </SectionHeading>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.5fr_1fr] md:gap-16">
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {aboutPreview.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Link href="/about" className="text-sm">
              Read the full story →
            </Link>
          </div>

          <div className="space-y-6">
            {aboutPreview.skills.map((group) => (
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
        </div>
      </Container>
    </section>
  );
}
