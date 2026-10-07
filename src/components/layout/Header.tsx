import Link from "next/link";
import { site } from "@/config/site";
import { NAV_LINKS } from "@/lib/constants";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks } from "@/components/layout/NavLinks";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="flex min-h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          {site.name}
          <span aria-hidden="true" className="text-accent-text">
            .
          </span>
        </Link>

        <NavLinks links={NAV_LINKS} />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={site.cta.href}
            className={buttonVariants({ size: "sm" })}
          >
            {site.cta.label}
          </Link>
          <MobileMenu links={NAV_LINKS} />
        </div>
      </Container>
    </header>
  );
}
