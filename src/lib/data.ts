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
  readonly summary: string;
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

export const experience: readonly ExperienceItem[] = [
  {
    company: "Northwind Labs",
    role: "Senior Full-Stack Developer",
    period: "2023 — Present",
    summary:
      "Lead developer on a data-heavy SaaS platform serving thousands of daily active users.",
    highlights: [
      "Cut initial load time by 60% with route-level caching and code splitting",
      "Built the internal design system now used by three product teams",
      "Mentored two engineers to independent feature ownership",
    ],
  },
  {
    company: "Acme Studio",
    role: "Full-Stack Developer",
    period: "2021 — 2023",
    summary:
      "Shipped client products end-to-end, from API design to production deployment.",
    highlights: [
      "Delivered 8 client projects across e-commerce and fintech",
      "Introduced automated testing, dropping regression bugs by half",
      "Set up CI/CD pipelines that cut release time from days to hours",
    ],
  },
  {
    company: "Freelance",
    role: "Web Developer",
    period: "2019 — 2021",
    summary:
      "Built websites and web apps for small businesses and startups.",
    highlights: [
      "Owned discovery, design, build, and handoff for every engagement",
      "Focused on performance and accessibility from the first commit",
    ],
  },
];

export const aboutPreview: AboutPreviewContent = {
  bio: [
    "I’m [NAME], a Full-Stack Developer who turns fuzzy problems into products people actually enjoy using. I care about the details that don’t show up in a screenshot: fast loads, sensible semantics, and code the next developer can read.",
  ],
  skills: [
    {
      category: "Frontend",
      skills: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    },
    {
      category: "Backend",
      skills: ["Node.js", "PostgreSQL", "GraphQL"],
    },
    {
      category: "Tooling",
      skills: ["Docker", "Vitest", "Playwright"],
    },
  ],
};

export const contactTeaser: ContactTeaserContent = {
  label: "Contact",
  body: "I’m available for freelance and full-time opportunities. Tell me about your project and I’ll get back to you within a day.",
};

export const aboutPage: AboutPageContent = {
  photo: {
    src: "/about/portrait.svg",
    alt: "Portrait of [NAME]",
  },
  story: [
    "I got into software the long way around — tinkering with small tools that made my own life easier, then discovering that other people wanted them too. That loop of building, shipping, and watching someone use a thing I made never got old.",
    "Today I work across the stack: data models and APIs one day, accessibility and pixel-tuning the next. I like problems where the messy requirements meet real constraints, because that’s where the interesting engineering lives. When I’m not shipping, I’m usually reading about rendering internals or mentoring someone through their first pull request.",
  ],
  values: [
    {
      title: "Accessible by default",
      body: "Semantic HTML first, ARIA where it earns its keep, and keyboard paths tested before the UI is called done.",
    },
    {
      title: "Performance is a feature",
      body: "Budgets, profiles, and real devices — fast is a decision made on every commit, not a cleanup sprint.",
    },
    {
      title: "Clarity over cleverness",
      body: "Code is read far more than it is written. I optimise for the next developer, including future me.",
    },
  ],
};
