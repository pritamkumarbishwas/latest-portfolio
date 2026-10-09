"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const next = scrollable > 0 ? window.scrollY / scrollable : 1;
      setProgress(Math.min(1, Math.max(0, next)));
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  const percent = Math.round(progress * 100);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-4 left-4 z-50 hidden items-center gap-4 rounded-full border border-border bg-card/85 py-2 pl-5 pr-2.5 shadow-lg backdrop-blur-xl lg:flex xl:bottom-6 xl:left-6 xl:gap-5 xl:py-2.5 xl:pl-6 xl:pr-3"
    >
      <span className="scroll-shine inline-block bg-clip-text text-xs font-bold uppercase tracking-[0.2em] text-transparent">
        Keep scrolling
      </span>
      <div className="flex items-center gap-3">
        <span className="min-w-[3.5ch] text-right font-display text-2xl font-bold tracking-tighter text-accent-text">
          {percent}%
        </span>
        <div className="relative flex size-10 items-center justify-center">
          <svg
            viewBox="0 0 40 40"
            className="absolute inset-0 size-full -rotate-90"
          >
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-foreground/10"
            />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-accent"
              pathLength={1}
              strokeDasharray={`${progress} 1`}
              strokeDashoffset={0}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
