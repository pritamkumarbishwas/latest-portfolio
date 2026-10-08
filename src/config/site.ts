import profile from "@/content/profile.json";

export const site = {
  name: profile.name,
  role: profile.role,
  description: `Portfolio of ${profile.name}, a ${profile.role} building fast, accessible products on the web.`,
  url: "https://example.com",
  email: profile.contact.email,
  phone: profile.contact.phone,
  location: profile.contact.location,
  cta: {
    label: "Hire me",
    href: "/#contact",
  },
} as const;
