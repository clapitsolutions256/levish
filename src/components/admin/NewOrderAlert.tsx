"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { ordersApi, useGetLatestOrdersQuery, type LatestOrder } from "@/store/ordersApi";
import type { AppDispatch } from "@/store/store";

const POLL_MS = 15000;

// A short two-note chime made with Web Audio, so no sound file is needed.
function playChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audio = new AudioCtx();
    [880, 1318.5].forEach((frequency, index) => {
      const start = audio.currentTime + index * 0.18;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.65);
    });
    setTimeout(() => audio.close(), 1200);
  } catch {
    // Sound is a bonus; the on-screen alert still shows.
  }
}

function notifyDesktop(order: LatestOrder) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const note = new Notification("New order received", {
    body: `${order.name || "A customer"}${order.city ? `, ${order.city}` : ""} · Rs. ${order.total.toLocaleString()}`,
    tag: order._id,
  });
  note.onclick = () => {
    window.focus();
    window.location.href = `/admin/orders/${order._id}`;
  };
}

export function NewOrderAlert({ enabled }: { enabled: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const { data } = useGetLatestOrdersQuery(undefined, {
    skip: !enabled,
    pollingInterval: POLL_MS,
    skipPollingIfUnfocused: false,
  });
  const [alerts, setAlerts] = useState<LatestOrder[]>([]);
  // Orders newer than this are new; it starts at the newest order seen on first load.
  const since = useRef<number | null>(null);
  const baseTitle = useRef("");

  useEffect(() => {
    if (!data) return;
    const times = data.map((order) => new Date(order.createdAt).getTime());
    if (since.current === null) {
      since.current = times.length ? Math.max(...times) : Date.now();
      return;
    }
    const fresh = data.filter((order) => new Date(order.createdAt).getTime() > (since.current ?? 0));
    if (!fresh.length) return;
    since.current = Math.max(since.current, ...times);
    setAlerts((current) => [...fresh, ...current].slice(0, 5));
    playChime();
    fresh.forEach(notifyDesktop);
    dispatch(ordersApi.util.invalidateTags(["Order", "Stats", "Customer", "Analytics"]));
  }, [data, dispatch]);

  // Ask for desktop notifications on the admin's first click; browsers only allow it after a click.
  useEffect(() => {
    if (!enabled || typeof Notification === "undefined" || Notification.permission !== "default") return;
    const ask = () => void Notification.requestPermission();
    window.addEventListener("pointerdown", ask, { once: true });
    return () => window.removeEventListener("pointerdown", ask);
  }, [enabled]);

  // Show the count of unseen orders in the tab title.
  useEffect(() => {
    if (!baseTitle.current) baseTitle.current = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = alerts.length ? `(${alerts.length}) New order · ${baseTitle.current}` : baseTitle.current;
  }, [alerts.length]);

  const dismiss = (id: string) => setAlerts((current) => current.filter((order) => order._id !== id));

  if (!alerts.length) return null;

  return (
    <div className="fixed right-5 top-5 z-[100] flex w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col gap-3" role="status" aria-live="assertive">
      {alerts.map((order) => (
        <div
          key={order._id}
          className="animate-slide-in-right overflow-hidden rounded-2xl border border-[#eadfe4] bg-white shadow-[0_18px_45px_rgba(11,11,11,0.18)]"
        >
          <div className="h-1 bg-gradient-to-r from-[var(--sage)] to-[var(--accent)]" />
          <div className="flex gap-3 p-4">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sage-tint)] text-[var(--accent)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--sage)]/40" aria-hidden="true" />
              <svg className="relative h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">New order received</p>
                <button
                  type="button"
                  onClick={() => dismiss(order._id)}
                  className="-mr-1 -mt-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Dismiss"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <p className="mt-0.5 truncate text-sm text-gray-600">
                {order.name || "A customer"}
                {order.city ? ` · ${order.city}` : ""}
              </p>
              <p className="mt-1 text-base font-bold text-[var(--accent)]">Rs. {order.total.toLocaleString()}</p>
              <Link
                href={`/admin/orders/${order._id}`}
                onClick={() => dismiss(order._id)}
                className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)]"
              >
                View order
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
