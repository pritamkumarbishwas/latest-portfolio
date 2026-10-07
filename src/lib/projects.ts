import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const frontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(slugPattern),
  summary: z.string().min(1),
  date: z.coerce.date(),
  tags: z.array(z.string().min(1)).min(1),
  cover: z.string().startsWith("/"),
  liveUrl: z.url().optional(),
  repoUrl: z.url().optional(),
  featured: z.boolean(),
  role: z.string().min(1),
  duration: z.string().min(1),
});

export type Project = z.infer<typeof frontmatterSchema>;

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "projects");

let cache: Project[] | null = null;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

export function getProjects(): Project[] {
  if (cache) return cache;

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"));

  const seen = new Set<string>();
  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);
    const result = frontmatterSchema.safeParse(data);

    if (!result.success) {
      throw new Error(
        `Invalid frontmatter in src/content/projects/${file}:\n${formatIssues(result.error)}`,
      );
    }

    const project = result.data;

    if (file !== `${project.slug}.mdx`) {
      throw new Error(
        `src/content/projects/${file}: filename must match slug "${project.slug}.mdx"`,
      );
    }
    if (seen.has(project.slug)) {
      throw new Error(`Duplicate project slug "${project.slug}"`);
    }
    seen.add(project.slug);

    return project;
  });

  cache = projects.sort((a, b) => b.date.getTime() - a.date.getTime());
  return cache;
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((project) => project.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return getProjects().filter((project) => project.featured);
}
