import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { mdxComponents } from "@/components/mdx";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getProject, getProjects } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${slug}`,
    type: "article",
    publishedTime: project.date,
  });
}

export default async function CaseStudyPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { default: CaseStudy } = await import(
    `@/content/projects/${slug}.mdx`
  );

  const projects = getProjects();
  const index = projects.findIndex((item) => item.slug === slug);
  const previous = index > 0 ? projects[index - 1] : undefined;
  const next =
    index >= 0 && index < projects.length - 1
      ? projects[index + 1]
      : undefined;

  return (
    <article>
      <Container className="py-20 md:py-28">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent-text"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All projects
        </Link>

        <p className="mt-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="h-px w-8 bg-accent" />
          Case study
        </p>

        <h1 className="mt-4 font-display font-medium tracking-tight">
          {project.title}
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          {project.summary}
        </p>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Role
            </dt>
            <dd className="mt-1.5 text-sm font-medium">{project.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Duration
            </dt>
            <dd className="mt-1.5 text-sm font-medium">{project.duration}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Date
            </dt>
            <dd className="mt-1.5 text-sm font-medium">
              <time dateTime={project.date.toISOString().slice(0, 10)}>
                {project.date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </time>
            </dd>
          </div>
        </dl>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Badge>{tag}</Badge>
            </li>
          ))}
        </ul>

        <Image
          src={project.cover}
          alt=""
          aria-hidden="true"
          width={1280}
          height={720}
          preload
          sizes="(max-width: 768px) 100vw, 64rem"
          className="mt-10 aspect-video w-full rounded-xl border border-border object-cover"
        />
      </Container>

      <Container>
        <div className="prose prose-neutral dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-a:text-accent-text">
          <CaseStudy components={mdxComponents} />
        </div>
      </Container>

      <Container className="pt-10">
        <section
          aria-labelledby="links-heading"
          className="rounded-xl border border-border bg-card p-6 md:p-8"
        >
          <h2 id="links-heading" className="font-display tracking-tight">
            Links
          </h2>

          <div className="mt-5 flex flex-wrap gap-4">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants()}
              >
                Live site
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : null}

            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary" })}
              >
                Repository
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : null}

            {!project.liveUrl && !project.repoUrl ? (
              <p className="text-sm text-muted-foreground">
                Available on request.
              </p>
            ) : null}
          </div>
        </section>

        <nav
          aria-label="More case studies"
          className="mt-12 flex flex-col justify-between gap-6 border-t border-border pt-8 sm:flex-row"
        >
          {previous ? (
            <Link
              href={`/projects/${previous.slug}`}
              className="group max-w-xs"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Previous
              </span>
              <span className="mt-1.5 block font-display tracking-tight transition-colors group-hover:text-accent-text">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          {next ? (
            <Link href={`/projects/${next.slug}`} className="group max-w-xs sm:text-right">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Next
              </span>
              <span className="mt-1.5 block font-display tracking-tight transition-colors group-hover:text-accent-text">
                {next.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      </Container>
    </article>
  );
}
