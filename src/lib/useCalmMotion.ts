"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const SMALL_SCREEN = "(max-width: 767px)";

/**
 * True when scroll-driven effects should stay still: the visitor asked for less motion, or it is a
 * phone, where moving and scaling big sections on every scroll frame makes cheaper phones stutter.
 */
export function useCalmMotion() {
  const reduced = useReducedMotion();
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(SMALL_SCREEN);
    const update = () => setSmall(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return Boolean(reduced) || small;
}
