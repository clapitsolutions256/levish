"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { hasCurrentPhoto } from "@/lib/cartToken";
import { whatsappLink } from "@/data/contact";

type TrackedOrder = {
  number: string;
  placedAt: string;
  status: string;
  total: number;
  paymentMethod: string;
  city: string;
  items: { name: string; size: string; color: string; quantity: number; price: number; image: string }[];
};

const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Packing" },
  { key: "shipped", label: "On the way" },
  { key: "delivered", label: "Delivered" },
];

const price = (value: number) => `Rs. ${value.toLocaleString()}`;
const date = (value: string) =>
  new Date(value).toLocaleString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export function TrackOrder() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setOrders(null);
        setError(data.error || "Could not look up your orders. Please try again.");
      } else {
        setOrders(data.orders ?? []);
      }
    } catch {
      setError("Could not look up your orders. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="section-heading">Track your order</h1>
      <p className="type-copy mt-2 text-[var(--muted)]">Enter the phone number you used when you ordered to see all your orders and where they are.</p>

      <form onSubmit={search} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="track-phone" className="sr-only">Phone number</label>
        <input
          id="track-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="03XX XXXXXXX"
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-5 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        <button type="submit" disabled={loading} className="skeuo-ink rounded-full px-8 py-3 font-medium disabled:opacity-60">
          {loading ? "Searching…" : "Track order"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      {orders && orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
          <p className="font-medium text-[var(--foreground)]">No orders found for this number.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Check the number, or{" "}
            <a href={whatsappLink("Hi Levish! I want to track my order.")} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)]">
              message us on WhatsApp
            </a>
            .
          </p>
        </div>
      ) : null}

      {orders && orders.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const cancelled = order.status === "cancelled";
            const step = STEPS.findIndex((item) => item.key === order.status);
            return (
              <li key={order.number + order.placedAt} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">Order #{order.number}</p>
                    <p className="text-xs text-[var(--muted)]">{date(order.placedAt)} · {order.city}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cancelled ? "bg-red-50 text-red-700" : "bg-[var(--sage-tint)] text-[var(--foreground)]"}`}>
                    {cancelled ? "Cancelled" : (STEPS[step]?.label ?? order.status)}
                  </span>
                </div>

                {!cancelled ? (
                  <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Order progress">
                    {STEPS.map((item, index) => (
                      <li key={item.key} className="text-center">
                        <div className={`h-1.5 rounded-full ${index <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                        <p className={`mt-1 text-[10px] leading-tight sm:text-xs ${index <= step ? "font-medium text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{item.label}</p>
                      </li>
                    ))}
                  </ol>
                ) : null}

                <ul className="mt-4 space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--border)]">
                        {hasCurrentPhoto(item.image) ? <Image src={item.image} alt="" fill className="object-cover" sizes="48px" /> : null}
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-medium text-[var(--foreground)]">{item.name}</p>
                        <p className="text-xs text-[var(--muted)]">{[item.color, item.size && `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-sm">
                  <span className="text-[var(--muted)]">{order.paymentMethod === "transfer" ? "Online transfer" : "Cash on delivery"}</span>
                  <span className="font-semibold text-[var(--foreground)]">{price(order.total)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="mt-8 text-sm text-[var(--muted)]">
        Have an account?{" "}
        <Link href="/account" className="font-medium text-[var(--accent)]">
          See your orders in your profile
        </Link>
        .
      </p>
    </div>
  );
}
