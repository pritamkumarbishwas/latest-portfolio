"use client";

import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";

import type { ChatProjectCardData } from "@/types/chat";

export function ProjectToolCard({ project }: { project: ChatProjectCardData }) {
  return (
    <article
      aria-label={`Project card: ${project.title}`}
      className="w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      {project.cover ? (
        <Image
          src={project.cover}
          alt=""
          aria-hidden="true"
          width={640}
          height={360}
          sizes="(max-width: 640px) 100vw, 24rem"
          className="aspect-video w-full border-b border-border object-cover"
        />
      ) : null}

      <div className="flex flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold leading-tight">
            {project.title}
          </h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" aria-hidden="true" />
            Project
          </span>
        </div>

        {project.period ? (
          <p className="text-[11px] text-muted-foreground">{project.period}</p>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <ul className="flex flex-wrap gap-1.5">
          {project.techStack.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border-strong px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>

        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] w-fit items-center gap-1 text-xs font-medium text-accent-text underline-offset-4 hover:underline"
          >
            Visit live site
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
