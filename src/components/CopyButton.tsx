"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the text is on screen and selectable anyway.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `${label} ${text}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-full font-sans tracking-normal select-none border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--accent)] transition hover:bg-[var(--sage-tint)]"
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.8} d="M5 15V6a2 2 0 012-2h9" />
        </svg>
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
