"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Lifts a pop-up out of the scrolling admin panel so it covers the whole screen, above the top bar
 * and dock, while staying inside `.admin-glass` so it keeps the admin look.
 */
export function ModalPortal({ children }: { children: React.ReactNode }) {
  const [host, setHost] = useState<Element | null>(null);
  useEffect(() => setHost(document.querySelector(".admin-glass") ?? document.body), []);
  return host ? createPortal(children, host) : null;
}
