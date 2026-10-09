import { site } from "@/config/site";
import { SOCIAL_LINKS } from "@/lib/constants";
import { Container } from "@/components/ui/container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-start justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center">
        <p>
          © {year} {site.name} · {site.location}
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <nav aria-label="Social links">
            <ul className="flex items-center gap-5">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent-text"
                  >
                    {social.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#top"
            className="transition-colors hover:text-accent-text"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </Container>
      <div className="border-t border-border bg-muted/30 py-4 text-center text-xs text-muted-foreground">
        <Container>
          <strong>Privacy Note:</strong> Chat messages are sent to an AI provider to generate responses. Please do not enter sensitive information.
        </Container>
      </div>
    </footer>
  );
}
