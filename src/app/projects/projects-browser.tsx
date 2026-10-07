"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/projects";
import { Stagger, StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

function chipClass(active: boolean) {
  return cn(
    "rounded-full border border-border-strong px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-accent-text hover:text-accent-text",
    active &&
      "border-accent-hover bg-accent text-accent-foreground hover:border-accent-hover hover:text-accent-foreground",
  );
}

export function ProjectsView({
  projects,
  tags,
  activeTag,
}: {
  projects: Project[];
  tags: string[];
  activeTag: string | null;
}) {
  const visible = activeTag
    ? projects.filter((project) => project.tags.includes(activeTag))
    : projects;

  return (
    <>
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
    </>
  );
}

export function ProjectsBrowser({
  projects,
  tags,
}: {
  projects: Project[];
  tags: string[];
}) {
  const params = useSearchParams();
  const tag = params.get("tag");
  const activeTag = typeof tag === "string" && tag.length > 0 ? tag : null;

  return <ProjectsView projects={projects} tags={tags} activeTag={activeTag} />;
}
