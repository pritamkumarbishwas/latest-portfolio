import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectsBrowser, ProjectsView } from "./projects-browser";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Case studies of selected work — the problem, the approach, the stack, and the results.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getProjects();
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();

  return (
    <section aria-labelledby="projects-heading">
      <Container className="py-20 md:py-28">
        <SectionHeading as="h1" id="projects-heading" label="Projects">
          Case <span className="font-serif italic">studies</span>
        </SectionHeading>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          How I work: problem, approach, stack, and measurable results.
        </p>

        <h2 id="project-list-heading" className="sr-only">
          All case studies
        </h2>

        <Suspense
          fallback={<ProjectsView projects={projects} tags={tags} activeTag={null} />}
        >
          <ProjectsBrowser projects={projects} tags={tags} />
        </Suspense>
      </Container>
    </section>
  );
}
