import { getProjects } from "@/lib/projects";
import { Stagger, StaggerItem } from "@/components/motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/project-card";

export function FeaturedProjects() {
  const projects = getProjects().slice(0, 3);

  return (
    <section id="work" aria-labelledby="work-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading id="work-heading" label="Featured projects">
          Things I’ve <span className="font-serif italic">shipped</span>
        </SectionHeading>

        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {projects.map((project, index) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} preload={index === 0} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
