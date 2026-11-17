"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    ttq?: { page: () => void };
  }
}

/** Reports page views on client navigations. The snippet in the page head already reports the first load. */
export function TikTokPageView() {
  const pathname = usePathname();
  const skipInitial = useRef(true);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    if (pathname.startsWith("/admin")) return;
    window.ttq?.page();
  }, [pathname]);

  return null;
}
