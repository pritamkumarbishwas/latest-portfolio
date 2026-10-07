"use client";

import { useEffect } from "react";

export function RevealObserver() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const hidden: Element[] = [];
    for (const el of elements) {
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        hidden.push(el);
      }
    }
    if (hidden.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-init");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of hidden) {
      el.classList.add("reveal-init");
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return null;
}
