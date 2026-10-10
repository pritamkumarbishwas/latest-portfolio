"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/project-card";
import { cn } from "@/lib/utils";

const trackClassName =
  "stagger -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const slideClassName = "w-[82vw] shrink-0 snap-start sm:w-[20rem] lg:w-[24rem] xl:w-[26rem]";

const navButtonClassName =
  "inline-flex size-10 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:border-accent-text hover:text-accent-text disabled:pointer-events-none disabled:opacity-40";

export function ProjectSlider({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const step = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (!first) return 0;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  }, []);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const distance = step();
    const max = track.scrollWidth - track.clientWidth;
    const current = distance > 0 ? Math.round(track.scrollLeft / distance) : 0;
    setIndex(Math.min(projects.length - 1, Math.max(0, current)));
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < max - 4);
  }, [projects.length, step]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    sync();
    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [sync]);

  const scrollByDirection = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: step() * direction,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  if (projects.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-sm tabular-nums text-muted-foreground">
          <span className="text-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden="true"> / </span>
          <span className="sr-only">of</span>
          {String(projects.length).padStart(2, "0")}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByDirection(-1)}
            disabled={!canPrev}
            aria-label="Previous project"
            className={navButtonClassName}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDirection(1)}
            disabled={!canNext}
            aria-label="Next project"
            className={navButtonClassName}
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        aria-label="Featured projects"
        className={cn(trackClassName, "mt-6")}
        style={
          {
            "--stagger-base": "0s",
            "--stagger-step": "0.1s",
          } as CSSProperties
        }
      >
        {projects.map((project, index) => (
          <StaggerItem key={project.slug} as="li" className={slideClassName}>
            <ProjectCard project={project} preload={index === 0} />
          </StaggerItem>
        ))}
      </ul>
    </div>
  );
}
