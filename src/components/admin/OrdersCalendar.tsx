"use client";

import { useMemo, useState } from "react";

/** Local calendar day of a timestamp, e.g. "2026-11-24" (the admin's own time zone). */
export function dayKey(value: string | Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** The day before or after a day key. */
export function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

export function formatDayLabel(key: string) {
  return new Date(`${key}T00:00:00`).toLocaleDateString("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type DayTotal = { count: number; total: number };

function compactRs(value: number) {
  if (value >= 100000) return `Rs. ${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `Rs. ${value}`;
}

/**
 * Month calendar of orders: every day shows how many orders came in and their value.
 * Clicking a day selects it; clicking it again clears the selection.
 */
export function OrdersCalendar({
  orders,
  selected,
  onSelect,
  accent,
}: {
  orders: { createdAt: string; total: number }[];
  selected: string | null;
  onSelect: (day: string | null) => void;
  /** Brand colour for the busy days and the selection. */
  accent: string;
}) {
  const totals = useMemo(() => {
    const map = new Map<string, DayTotal>();
    for (const order of orders) {
      const key = dayKey(order.createdAt);
      const day = map.get(key) ?? { count: 0, total: 0 };
      day.count += 1;
      day.total += Number(order.total) || 0;
      map.set(key, day);
    }
    return map;
  }, [orders]);

  const [month, setMonth] = useState(() => {
    const base = selected ? new Date(`${selected}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = dayKey(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // weeks start on Monday
  const days = Array.from({ length: daysInMonth }, (_, i) => dayKey(new Date(year, monthIndex, i + 1)));

  const monthDays = days.map((key) => totals.get(key)).filter(Boolean) as DayTotal[];
  const monthCount = monthDays.reduce((sum, day) => sum + day.count, 0);
  const monthTotal = monthDays.reduce((sum, day) => sum + day.total, 0);
  const busiest = Math.max(0, ...monthDays.map((day) => day.count));
  const activeDays = monthDays.length;

  const goTo = (key: string) => {
    const date = new Date(`${key}T00:00:00`);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    onSelect(key);
  };

  const navButton =
    "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50";

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className={navButton} onClick={() => setMonth(new Date(year, monthIndex - 1, 1))} aria-label="Previous month">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="min-w-[9.5rem] text-center text-base font-bold text-gray-900">
            {month.toLocaleDateString("en-PK", { month: "long", year: "numeric" })}
          </h2>
          <button type="button" className={navButton} onClick={() => setMonth(new Date(year, monthIndex + 1, 1))} aria-label="Next month">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(today)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => goTo(shiftDay(today, -1))}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Yesterday
          </button>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            Go to
            <input
              type="date"
              value={selected ?? ""}
              max={today}
              onChange={(event) => (event.target.value ? goTo(event.target.value) : onSelect(null))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none"
            />
          </label>
        </div>
      </div>

      {/* Month summary */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center sm:max-w-md">
        {[
          { label: "Orders this month", value: monthCount.toLocaleString() },
          { label: "Value", value: `Rs. ${monthTotal.toLocaleString()}` },
          { label: "Days with orders", value: `${activeDays}/${daysInMonth}` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-gray-50 px-2 py-2">
            <p className="text-sm font-bold text-gray-900">{item.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">
            {weekday}
          </div>
        ))}
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((key, i) => {
          const day = totals.get(key);
          const isSelected = selected === key;
          const isToday = key === today;
          const isFuture = key > today;
          // Busier days get a stronger tint of the brand colour.
          const strength = day && busiest ? 0.12 + 0.5 * (day.count / busiest) : 0;
          return (
            <button
              key={key}
              type="button"
              disabled={isFuture}
              onClick={() => onSelect(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={`${formatDayLabel(key)}: ${day ? `${day.count} order${day.count === 1 ? "" : "s"}` : "no orders"}`}
              className={`relative flex min-h-[3.25rem] flex-col items-start justify-between rounded-lg border p-1.5 text-left transition sm:min-h-[4.5rem] sm:p-2 ${
                isSelected ? "border-transparent text-white shadow-md" : "border-gray-100 hover:border-gray-300"
              } ${isFuture ? "cursor-default opacity-35" : ""}`}
              style={
                isSelected
                  ? { backgroundColor: accent }
                  : day
                    ? { backgroundColor: `color-mix(in srgb, ${accent} ${Math.round(strength * 100)}%, white)` }
                    : undefined
              }
            >
              <span
                className={`text-xs font-semibold sm:text-sm ${isSelected || strength > 0.45 ? "text-white" : "text-gray-700"} ${
                  isToday && !isSelected ? "rounded-full px-1.5 ring-1 ring-gray-400" : ""
                }`}
              >
                {i + 1}
              </span>
              {day ? (
                <span className="w-full">
                  <span className={`block text-[11px] font-bold leading-tight sm:text-xs ${isSelected || strength > 0.45 ? "text-white" : "text-gray-900"}`}>
                    {day.count}
                    <span className="hidden font-medium sm:inline"> order{day.count === 1 ? "" : "s"}</span>
                  </span>
                  <span className={`hidden text-[10px] leading-tight sm:block ${isSelected || strength > 0.45 ? "text-white/85" : "text-gray-500"}`}>
                    {compactRs(day.total)}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Tap a day to see its orders. Counts follow the status and search filters above.
      </p>
    </div>
  );
}
