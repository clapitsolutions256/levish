"use client";

import { useState, type FormEvent } from "react";
import { contact } from "@/data/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "We couldn't send your message.");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send your message.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="card-warm mx-auto mt-8 max-w-3xl p-6 text-center sm:p-8" role="status">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Message sent</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Thank you. We&apos;ll reply to your email within 24–48 hours. For a quicker answer, message us on{" "}
          <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="card-warm mx-auto mt-8 max-w-3xl space-y-5 p-6 sm:p-8" onSubmit={onSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Send a message</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">We reply within 24–48 hours on business days.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Name
          </label>
          <input id="name" name="name" type="text" required className="input-warm" placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input-warm" placeholder="you@example.com" />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
          Subject
        </label>
        <select id="subject" name="subject" className="input-warm">
          <option value="order">Order / Shipping</option>
          <option value="return">Returns / Exchanges</option>
          <option value="product">Product Question</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="input-warm resize-y"
          placeholder="How can we help?"
        />
      </div>
      {/* Hidden from people; bots that fill it are ignored. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {status === "error" ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={status === "sending"} className="btn-primary disabled:opacity-70">
        {status === "sending" ? "Sending…" : "Send Message"}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
