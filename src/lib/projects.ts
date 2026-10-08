import "server-only";
import profile from "@/content/profile.json";

export type Project = {
  readonly title: string;
  readonly slug: string;
  readonly summary: string;
  readonly cover: string;
  readonly period?: string;
  readonly liveUrl?: string;
  readonly repoUrl?: string;
  readonly links?: readonly { readonly label: string; readonly href: string }[];
  readonly techStack: readonly string[];
  readonly highlights: readonly string[];
};

/** Every project in display order, sourced from src/content/profile.json. */
const projects: readonly Project[] = profile.projects;

export function getProjects(): Project[] {
  return [...projects];
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
