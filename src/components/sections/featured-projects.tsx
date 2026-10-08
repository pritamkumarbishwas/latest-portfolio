import { getProjects } from "@/lib/projects";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectSlider } from "@/components/project-slider";

export function FeaturedProjects() {
  const projects = getProjects();

  return (
    <section id="work" aria-labelledby="work-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading id="work-heading" label="Featured projects">
          Things I’ve <span className="font-serif italic">shipped</span>
        </SectionHeading>

        <ProjectSlider projects={projects} />
      </Container>
    </section>
  );
}
