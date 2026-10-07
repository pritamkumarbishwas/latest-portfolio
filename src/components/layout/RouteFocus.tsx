"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function RouteFocus() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
