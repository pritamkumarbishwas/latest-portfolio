import profile from "@/content/profile.json";

export type HeroContent = {
  readonly badge: string;
  readonly valueProposition: string;
  readonly secondaryCta: {
    readonly label: string;
    readonly href: string;
  };
};

export type ExperienceItem = {
  readonly company: string;
  readonly role: string;
  readonly period: string;
  readonly location?: string;
  readonly mode?: string;
  readonly summary?: string;
  readonly techStack?: readonly string[];
  readonly highlights: readonly string[];
};

export type SkillGroup = {
  readonly category: string;
  readonly skills: readonly string[];
};

export type AboutPreviewContent = {
  readonly bio: readonly string[];
  readonly skills: readonly SkillGroup[];
};

export type ContactTeaserContent = {
  readonly label: string;
  readonly body: string;
};

export type AboutPageContent = {
  readonly photo: {
    readonly src: string;
    readonly alt: string;
  };
  readonly story: readonly string[];
  readonly values: readonly {
    readonly title: string;
    readonly body: string;
  }[];
};

export const hero: HeroContent = {
  badge: "Available for new projects",
  valueProposition:
    "crafting fast, accessible products on the web — from database to pixel.",
  secondaryCta: {
    label: "View work",
    href: "#work",
  },
};

/** Work history, sourced from src/content/profile.json. */
export const experience: readonly ExperienceItem[] = profile.experience;

/** Professional summary, sourced from src/content/profile.json. */
export const summary: string = profile.summary;

/** Every skill group, sourced from src/content/profile.json. */
export const skills: readonly SkillGroup[] = profile.skills;

const HOME_SKILL_GROUPS = 4;

export const aboutPreview: AboutPreviewContent = {
  bio: [summary],
  skills: skills.slice(0, HOME_SKILL_GROUPS),
};

export const contactTeaser: ContactTeaserContent = {
  label: "Contact",
  body: "I’m available for freelance and full-time opportunities. Tell me about your project and I’ll get back to you within a day.",
};

/** Photo, story, and values for the about page, sourced from src/content/profile.json. */
export const aboutPage: AboutPageContent = {
  photo: profile.photo,
  story: profile.story,
  values: profile.values,
};
