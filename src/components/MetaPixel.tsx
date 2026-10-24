"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { readCustomerSession } from "@/lib/customerSession";
import { identifyMetaUser, trackCatalogView } from "@/lib/metaPixel";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function identifyFromSession() {
  const session = readCustomerSession();
  if (!session) return;
  const [firstName, ...rest] = session.name.split(" ");
  identifyMetaUser({
    email: session.email,
    firstName,
    lastName: rest.join(" "),
    externalId: session.id,
  });
}

/** Fires PageView on client navigations. The base snippet already tracks the first load. */
export function MetaPixelPageView() {
  const pathname = usePathname();
  const skipInitial = useRef(true);

  useEffect(() => {
    identifyFromSession();
    const onCustomer = () => identifyFromSession();
    window.addEventListener("empulse-customer", onCustomer);
    return () => window.removeEventListener("empulse-customer", onCustomer);
  }, []);

  useEffect(() => {
    if (skipInitial.current) {
      skipInitial.current = false;
      return;
    }
    if (pathname.startsWith("/admin")) return;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}

export function MetaCatalogView({
  name,
  category,
  ids,
}: {
  name: string;
  category: string;
  ids: string[];
}) {
  const key = `${name}|${category}|${ids.join(",")}`;
  const seen = useRef("");

  useEffect(() => {
    if (seen.current === key) return;
    seen.current = key;
    trackCatalogView({ name, category, ids });
  }, [key, name, category, ids]);

  return null;
}
