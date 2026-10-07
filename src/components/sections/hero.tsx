import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { hero } from "@/lib/data";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";

const reveal = (delay: number) =>
  ({ "--reveal-delay": `${delay}s` }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_0%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]"
      />

      <Container className="relative flex flex-col py-24 md:py-36">
        <div className="hero-fade">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            {hero.badge}
          </p>
        </div>

        <div className="hero-reveal mt-8" style={reveal(0.08)}>
          <h1 className="font-display font-medium tracking-tight">
            Hi, I’m <span className="text-accent-text">{site.name}</span>
          </h1>
        </div>

        <div className="hero-reveal mt-6" style={reveal(0.16)}>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            A{" "}
            <span className="font-serif italic text-foreground">
              {site.role}
            </span>{" "}
            {hero.valueProposition}
          </p>
        </div>

        <div
          className="hero-reveal mt-10 flex flex-wrap items-center gap-4"
          style={reveal(0.24)}
        >
          <Link href={site.cta.href} className={buttonVariants()}>
            {site.cta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className={buttonVariants({ variant: "secondary" })}
          >
            {hero.secondaryCta.label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
