import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { getProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const home = site.url.replace(/\/$/, "");

  const pages: MetadataRoute.Sitemap = [
    { url: `${home}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${home}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${home}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${home}/contact`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const projects: MetadataRoute.Sitemap = getProjects().map((project) => ({
    url: `${home}/projects/${project.slug}`,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...pages, ...projects];
}
