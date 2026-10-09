import profile from "@/content/profile.json";

export type HeroContent = {
  readonly badge: string;
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

export type Certification = {
  readonly title: string;
  readonly issuer: string;
  readonly platform: string;
  readonly date: string;
  readonly url?: string;
  readonly description: string;
};

export type EducationItem = {
  readonly institution: string;
  readonly period: string;
  readonly degree: string;
  readonly detail?: string;
  readonly location?: string;
};

export const hero: HeroContent = {
  badge: "Open to the right opportunity",
  secondaryCta: {
    label: "View work",
    href: "#work",
  },
};

/** Work history, sourced from src/content/profile.json. */
export const experience: readonly ExperienceItem[] = profile.experience;

/** Professional summary, sourced from src/content/profile.json. */
export const summary: string = profile.summary;

/** Short professional summary, shown as the home hero tagline. */
export const tagline: string = profile.summaryShort;

/** Every skill group, sourced from src/content/profile.json. */
export const skills: readonly SkillGroup[] = profile.skills;

const HOME_SKILL_GROUPS = 4;
const HOME_SKILLS_PER_GROUP = 5;

export const aboutPreview: AboutPreviewContent = {
  bio: [profile.summaryShort],
  skills: skills
    .slice(0, HOME_SKILL_GROUPS)
    .map((group) => ({
      category: group.category,
      skills: group.skills.slice(0, HOME_SKILLS_PER_GROUP),
    })),
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

/** Certifications, sourced from src/content/profile.json. */
export const certifications: readonly Certification[] = profile.certifications;

/** Education history, sourced from src/content/profile.json. */
export const education: readonly EducationItem[] = profile.education;

export type AchievementItem = {
  readonly text: string;
  readonly href?: string;
};

/** Achievements, sourced from src/content/profile.json. */
export const achievements: readonly AchievementItem[] = profile.achievements;
