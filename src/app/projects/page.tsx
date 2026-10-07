import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";
import { Stagger, StaggerItem } from "@/components/motion";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Case studies of selected work — the problem, the approach, the stack, and the results.",
  path: "/projects",
});

function chipClass(active: boolean) {
  return cn(
    "rounded-full border border-border-strong px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-accent-text hover:text-accent-text",
    active &&
      "border-accent-hover bg-accent text-accent-foreground hover:border-accent-hover hover:text-accent-foreground",
  );
}

export default async function ProjectsPage({
  searchParams,
}: PageProps<"/projects">) {
  const { tag } = await searchParams;
  const activeTag = typeof tag === "string" && tag.length > 0 ? tag : null;

  const projects = getProjects();
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort();
  const visible = activeTag
    ? projects.filter((project) => project.tags.includes(activeTag))
    : projects;

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

        <nav
          aria-label="Filter projects by tag"
          className="mt-8 flex flex-wrap gap-2"
        >
          <Link
            href="/projects"
            aria-current={activeTag === null ? "true" : undefined}
            className={chipClass(activeTag === null)}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/projects?tag=${encodeURIComponent(tag)}`}
              aria-current={activeTag === tag ? "true" : undefined}
              className={chipClass(activeTag === tag)}
            >
              {tag}
            </Link>
          ))}
        </nav>

        <p className="sr-only" role="status">
          {visible.length === 0
            ? `No case studies match ${activeTag}.`
            : activeTag
              ? `Showing ${visible.length} of ${projects.length} case studies tagged ${activeTag}.`
              : `Showing all ${projects.length} case studies.`}
        </p>

        {visible.length > 0 ? (
          <Stagger
            as="ul"
            className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((project) => (
              <StaggerItem as="li" key={project.slug}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <p className="mt-12 rounded-xl border border-border bg-card p-8 text-muted-foreground">
            No case studies match “{activeTag}”.{" "}
            <Link
              href="/projects"
              className="text-accent-text underline-offset-4 hover:underline"
            >
              Clear filter
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}
