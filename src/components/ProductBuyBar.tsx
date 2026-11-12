"use client";

import { useEffect, useState, type RefObject } from "react";
import { whatsappLink } from "@/data/contact";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

/**
 * Phone-only bar above the bottom menu while the size picker is off screen:
 * the price, a button that brings the size picker into view, and a WhatsApp question.
 */
export function ProductBuyBar({ name, price, target }: { name: string; price: number; target: RefObject<HTMLElement | null> }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = target.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting), { rootMargin: "0px 0px -120px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      className={`fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 transition-all duration-300 md:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!show}
    >
      <div className="glass-solid flex items-center gap-2 rounded-full p-1.5 pl-2">
        <a
          href={whatsappLink(`Hi Levish! I have a question about "${name}".`)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={show ? 0 : -1}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#25D366] px-3 text-xs font-semibold text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.05 2a9.9 9.9 0 00-8.5 15l-1.4 5 5.2-1.4A9.9 9.9 0 1012.05 2zm5.4 13.9c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-1.6-.5-3.6-1.7-4.9-3.6-.6-.8-1-1.7-1-2.6 0-1.3.7-1.9 1-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3z" />
          </svg>
          Ask
        </a>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--foreground)]">{formatPrice(price)}</p>
        <button
          type="button"
          tabIndex={show ? 0 : -1}
          onClick={() => target.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="skeuo-ink h-11 shrink-0 rounded-full px-5 text-sm font-medium"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
