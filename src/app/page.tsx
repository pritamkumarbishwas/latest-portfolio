import type { Metadata } from "next";
import { site } from "@/config/site";
import { SOCIAL_LINKS } from "@/lib/constants";
import { skills, summary } from "@/lib/data";
import { JsonLd } from "@/components/json-ld";
import { AboutPreview } from "@/components/sections/about-preview";
import { ContactTeaser } from "@/components/sections/contact-teaser";
import { Experience } from "@/components/sections/experience";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: summary,
  url: site.url,
  email: `mailto:${site.email}`,
  sameAs: SOCIAL_LINKS.map((link) => link.href),
  knowsAbout: [...new Set(skills.flatMap((group) => group.skills))],
};

export default function Home() {
  return (
    <>
      <JsonLd data={personJsonLd} />
      <Hero />
      <FeaturedProjects />
      <AboutPreview />
      <Experience />
      <ContactTeaser />
    </>
  );
}
