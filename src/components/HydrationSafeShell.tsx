"use client";

import { useState, useEffect } from "react";

/**
 * Renders children only after client mount to avoid hydration mismatches
 * caused by browser extensions (e.g. bis_skin_checked) modifying the DOM.
 */
export function HydrationSafeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col flex-1 bg-[var(--background)]" />
    );
  }
  return <>{children}</>;
}
