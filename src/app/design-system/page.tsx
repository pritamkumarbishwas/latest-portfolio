import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Showcase } from "./showcase";

export const metadata: Metadata = {
  title: "Design System",
  description: "Temporary internal reference for tokens and UI primitives.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DesignSystemPage() {
  return (
    <div className="py-12 md:py-16">
      <Container className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Internal
          </p>
          <h1 className="mt-3 font-display font-medium tracking-tight">
            Design System
          </h1>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Token and component reference — temporary route. Each panel forces a
          theme regardless of the header toggle, so both modes can be reviewed
          side by side.
        </p>
      </Container>

      <Container className="mt-10 space-y-8">
        <section
          aria-label="Design system in light theme"
          className="light overflow-hidden rounded-2xl border border-border bg-background text-foreground"
        >
          <p className="border-b border-border px-6 py-4 text-sm text-muted-foreground">
            Theme: light (.light)
          </p>
          <Showcase theme="light" />
        </section>

        <section
          aria-label="Design system in dark theme"
          className="dark overflow-hidden rounded-2xl border border-border bg-background text-foreground"
        >
          <p className="border-b border-border px-6 py-4 text-sm text-muted-foreground">
            Theme: dark (.dark)
          </p>
          <Showcase theme="dark" />
        </section>
      </Container>
    </div>
  );
}
