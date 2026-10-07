"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { NavLink } from "@/lib/constants";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export function MobileMenu({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hrefFor = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables = panel?.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      if (!focusables || focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      const focusIsOutside = active === null || !panel?.contains(active);

      if (focusIsOutside) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent-text hover:text-accent-text md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Menu className="size-4" aria-hidden="true" />
        )}
      </button>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-background md:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={hrefFor(link.href)}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
