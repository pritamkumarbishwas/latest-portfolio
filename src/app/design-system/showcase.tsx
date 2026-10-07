import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Link } from "@/components/ui/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { TagList } from "@/components/ui/tag-list";
import { Textarea } from "@/components/ui/textarea";

type ThemeName = "light" | "dark";

const colorTokens = [
  { name: "background", token: "--background" },
  { name: "foreground", token: "--foreground" },
  { name: "card", token: "--card" },
  { name: "card-foreground", token: "--card-foreground" },
  { name: "muted", token: "--muted" },
  { name: "muted-foreground", token: "--muted-foreground" },
  { name: "border", token: "--border" },
  { name: "accent", token: "--accent" },
  { name: "accent-foreground", token: "--accent-foreground" },
  { name: "accent-hover", token: "--accent-hover" },
  { name: "accent-text", token: "--accent-text" },
] as const;

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-10 first:border-t-0">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Swatch({ name, token }: { name: string; token: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="size-10 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: `var(${token})` }}
      />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">var({token})</p>
      </div>
    </div>
  );
}

function TypeSample({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={className}>{children}</div>
    </div>
  );
}

const radii = [
  { label: "sm", className: "rounded-sm" },
  { label: "md", className: "rounded-md" },
  { label: "lg", className: "rounded-lg" },
  { label: "xl", className: "rounded-xl" },
  { label: "full", className: "rounded-full" },
] as const;

const shadows = [
  { label: "shadow-sm", className: "shadow-sm" },
  { label: "shadow-md", className: "shadow-md" },
  { label: "shadow-lg", className: "shadow-lg" },
] as const;

export function Showcase({ theme }: { theme: ThemeName }) {
  const id = (name: string) => `ds-${theme}-${name}`;

  return (
    <Container>
      <Block title="Color tokens">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((color) => (
            <Swatch key={color.token} name={color.name} token={color.token} />
          ))}
        </div>
      </Block>

      <Block title="Typography scale">
        <div className="space-y-6">
          <TypeSample
            label="h1 · text-h1 (fluid)"
            className="text-h1 font-display font-medium tracking-tight"
          >
            Design system
          </TypeSample>
          <TypeSample
            label="h2 · text-h2 (fluid)"
            className="text-h2 font-display"
          >
            Section heading
          </TypeSample>
          <TypeSample
            label="h3 · text-h3 (fluid)"
            className="text-h3 font-display"
          >
            Card title
          </TypeSample>
          <TypeSample
            label="h4 · text-h4 (fluid)"
            className="text-h4 font-display"
          >
            Subsection title
          </TypeSample>
          <TypeSample
            label="body · text-body (fluid)"
            className="max-w-2xl text-body"
          >
            Body copy is Inter at a fluid size with a comfortable 1.65 line
            height — the default for paragraphs across the site.
          </TypeSample>
          <TypeSample
            label="small · text-sm (fluid)"
            className="max-w-2xl text-muted-foreground"
          >
            Small text for captions, metadata, and secondary labels.
          </TypeSample>
        </div>
      </Block>

      <Block title="Radius">
        <div className="flex flex-wrap items-end gap-6">
          {radii.map((radius) => (
            <div key={radius.label} className="text-center">
              <div
                className={`size-16 border border-border bg-card ${radius.className}`}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {radius.label}
              </p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Shadows">
        <div className="flex flex-wrap gap-6">
          {shadows.map((shadow) => (
            <div
              key={shadow.label}
              className={`rounded-xl bg-card p-6 text-sm text-muted-foreground ${shadow.className}`}
            >
              {shadow.label}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            Primary sm
          </Button>
          <Button variant="primary">Primary md</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </Block>

      <Block title="Badge & tags">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
        <div className="mt-4">
          <TagList items={["TypeScript", "React", "Next.js"]} />
        </div>
      </Block>

      <Block title="Card & link">
        <Card className="max-w-md">
          <h3 className="font-display tracking-tight">Card title</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cards use the card background token, border, and xl radius.
          </p>
          <div className="mt-4">
            <Link href="/projects">
              Read more
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Card>
      </Block>

      <Block title="Form fields">
        <div className="grid max-w-xl gap-6">
          <div className="grid gap-2">
            <label htmlFor={id("input")} className="text-sm font-medium">
              Label
            </label>
            <Input id={id("input")} placeholder="Placeholder text" />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={id("input-error")}
              className="text-sm font-medium"
            >
              With error
            </label>
            <Input
              id={id("input-error")}
              defaultValue="not-an-email"
              aria-invalid="true"
              aria-describedby={id("input-error-message")}
            />
            <p
              id={id("input-error-message")}
              className="text-xs text-accent-text"
            >
              This field is invalid.
            </p>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={id("textarea")}
              className="text-sm font-medium"
            >
              Textarea
            </label>
            <Textarea
              id={id("textarea")}
              rows={4}
              placeholder="Tell me about your project…"
            />
          </div>
        </div>
      </Block>

      <Block title="Section heading & container">
        <SectionHeading
          id={id("section-heading")}
          label="Section label"
        >
          Featured <span className="font-serif italic">work</span>
        </SectionHeading>
        <div className="mt-6 rounded-lg border border-dashed border-border p-4">
          <Container className="rounded-lg bg-card p-4 text-sm text-muted-foreground">
            Container · mx-auto · max-w-5xl · px-6
          </Container>
        </div>
      </Block>
    </Container>
  );
}
