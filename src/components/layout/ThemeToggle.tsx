"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? isDark
      ? "Switch to light theme"
      : "Switch to dark theme"
    : "Toggle color theme";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border-strong text-muted-foreground transition-colors hover:border-accent-text hover:text-accent-text"
    >
      <Sun className="hidden size-4 dark:inline" aria-hidden="true" />
      <Moon className="inline size-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
