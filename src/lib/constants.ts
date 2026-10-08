import profile from "@/content/profile.json";

export type NavLink = {
  readonly href: string;
  readonly label: string;
};

export type SocialLink = {
  readonly href: string;
  readonly label: string;
};

export const NAV_LINKS: readonly NavLink[] = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export const SOCIAL_LINKS: readonly SocialLink[] = profile.contact.links;
