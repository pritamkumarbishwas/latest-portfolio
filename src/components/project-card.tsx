import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/components/ui/link";

export function ProjectCard({
  project,
  preload = false,
}: {
  project: Project;
  preload?: boolean;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card motion-safe:duration-200 motion-safe:transition-transform motion-safe:hover:-translate-y-1">
      <Image
        src={project.cover}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        preload={preload}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="aspect-video w-full border-b border-border object-cover"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display tracking-tight">
            <Link
              href={`/projects/${project.slug}`}
              className="transition-colors hover:text-accent-text"
            >
              {project.title}
            </Link>
          </h3>
          <time
            dateTime={project.date.toISOString().slice(0, 10)}
            className="shrink-0 text-sm text-muted-foreground"
          >
            {project.date.getFullYear()}
          </time>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-sm">
          <Link href={`/projects/${project.slug}`}>Case study</Link>

          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 transition-colors hover:text-accent-text hover:underline"
            >
              Live
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : null}

          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 transition-colors hover:text-accent-text hover:underline"
            >
              GitHub
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
