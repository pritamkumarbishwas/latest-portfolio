"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ActiveState = {
  pathname: string;
  id: string;
};

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const [active, setActive] = useState<ActiveState | null>(null);

  useEffect(() => {
    const sections = links
      .filter((link) => link.href.startsWith("#"))
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) {
      return;
    }

    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.isIntersecting);
        });
        const firstVisible = links.find(
          (link) =>
            link.href.startsWith("#") && visible.get(link.href.slice(1)),
        );
        if (firstVisible) {
          setActive({ pathname, id: firstVisible.href.slice(1) });
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links, pathname]);

  const activeId = active && active.pathname === pathname ? active.id : null;
  const hrefFor = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  return (
    <nav aria-label="Main">
      <ul className="hidden items-center gap-6 md:flex">
        {links.map((link) => {
          const isHash = link.href.startsWith("#");
          const isActive = isHash
            ? activeId === link.href.slice(1)
            : pathname === link.href;

          return (
            <li key={link.href}>
              <Link
                href={hrefFor(link.href)}
                aria-current={
                  isActive ? (isHash ? "location" : "page") : undefined
                }
                className={cn(
                  "text-sm text-muted-foreground transition-colors hover:text-foreground",
                  isActive &&
                    "text-foreground underline decoration-accent-text underline-offset-4",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
