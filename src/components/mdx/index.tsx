import type { ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeText).join("");
  }
  return "";
}

function heading(Tag: "h2" | "h3" | "h4") {
  return function Heading({ children }: { children?: ReactNode }) {
    const text = nodeText(children);
    return <Tag id={text ? slugify(text) : undefined}>{children}</Tag>;
  };
}

export type CalloutType = "note" | "tip" | "warning";

const calloutLabels: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  warning: "Warning",
};

export function Callout({
  type = "note",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-muted p-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-text">
        {calloutLabels[type]}
      </p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h1: heading("h2"),
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  a: ({ href, children }) => {
    const external = /^https?:\/\//.test(href ?? "");
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-accent-text underline-offset-4 hover:underline"
      >
        {children}
        {external ? (
          <span className="sr-only"> (opens in new tab)</span>
        ) : null}
      </a>
    );
  },
  img: ({ src, alt }: { src?: ImageProps["src"]; alt?: string }) => (
    <Image
      src={src ?? ""}
      alt={alt ?? ""}
      width={1280}
      height={720}
      sizes="(max-width: 768px) 100vw, 64rem"
      className="h-auto w-full"
    />
  ),
  pre: ({ children }) => (
    <pre
      tabIndex={0}
      role="region"
      aria-label="Code sample"
      className="not-prose my-6 overflow-x-auto rounded-xl border border-border bg-muted p-4 font-mono text-sm leading-relaxed"
    >
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-") ?? false;
    if (isBlock) {
      return (
        <code className={cn("font-mono text-[0.875em]", className)}>
          {children}
        </code>
      );
    }
    return (
      <code className="not-prose rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-accent-text">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-accent">{children}</blockquote>
  ),
};
