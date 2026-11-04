"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/types";
import { sameType } from "@/lib/productTypes";

type Chart = {
  title: string;
  columns: string[];
  // The column holding the size shown on the product (EU for shoes), used to highlight its sizes.
  keyColumn: number;
  // One table, or several shown as tabs (e.g. Men / Women).
  tables: { label: string; rows: string[][] }[];
  measure: { label: string; text: string }[];
};

// Standard international sizing. Brands can differ slightly, so the modal says so.
const charts: Record<"shoes" | "bottoms" | "tops", Chart> = {
  // On's own conversion chart; the store lists shoes in EU sizes.
  shoes: {
    title: "Shoes size chart",
    columns: ["US", "UK", "EU", "CM"],
    keyColumn: 2,
    tables: [
      {
        label: "Men",
        rows: [
          ["7", "6.5", "40", "25"],
          ["7.5", "7", "40.5", "25.5"],
          ["8", "7.5", "41", "26"],
          ["8.5", "8", "42", "26.5"],
          ["9", "8.5", "42.5", "27"],
          ["9.5", "9", "43", "27.5"],
          ["10", "9.5", "44", "28"],
          ["10.5", "10", "44.5", "28.5"],
          ["11", "10.5", "45", "29"],
          ["11.5", "11", "46", "29.5"],
          ["12", "11.5", "47", "30"],
          ["13", "12.5", "48", "31"],
          ["14", "13.5", "49", "31.5"],
        ],
      },
      {
        label: "Women",
        rows: [
          ["5", "3", "36", "22"],
          ["5.5", "3.5", "36.5", "22.5"],
          ["6", "4", "37", "23"],
          ["6.5", "4.5", "37.5", "23.5"],
          ["7", "5", "38", "24"],
          ["7.5", "5.5", "38.5", "24.5"],
          ["8", "6", "39", "25"],
          ["8.5", "6.5", "40", "25.5"],
          ["9", "7", "40.5", "26"],
          ["9.5", "7.5", "41", "26.5"],
          ["10", "8", "42", "27"],
          ["10.5", "8.5", "42.5", "27.5"],
          ["11", "9", "43", "28"],
        ],
      },
    ],
    measure: [
      { label: "Foot length (CM)", text: "Stand on paper with your heel against a wall, mark the tip of your longest toe and measure from the wall to the mark." },
      { label: "In between?", text: "Pick the larger size, especially for running and lifestyle sneakers." },
    ],
  },
  bottoms: {
    title: "Trousers & jeans size chart",
    columns: ["Waist size", "Fits", "Waist (in)", "Waist (cm)", "Hip (cm)"],
    keyColumn: 0,
    tables: [
      {
        label: "",
        rows: [
          ["28", "XS", "28", "71", "89"],
          ["30", "S", "30", "76", "94"],
          ["32", "M", "32", "81", "99"],
          ["34", "L", "34", "86", "104"],
          ["36", "XL", "36", "91", "109"],
          ["38", "XXL", "38", "97", "114"],
          ["40", "3XL", "40", "102", "119"],
          ["42", "4XL", "42", "107", "124"],
        ],
      },
    ],
    measure: [
      { label: "Waist", text: "Measure around your natural waist, just above the belly button, keeping the tape a little loose." },
      { label: "Hip", text: "Measure around the fullest part of your hips with your feet together." },
    ],
  },
  tops: {
    title: "Tops & outerwear size chart",
    columns: ["Size", "Chest (in)", "Chest (cm)", "Length (cm)", "Shoulder (cm)"],
    keyColumn: 0,
    tables: [
      {
        label: "",
        rows: [
          ["XS", "34–36", "86–91", "66", "42"],
          ["S", "36–38", "91–97", "69", "44"],
          ["M", "38–40", "97–102", "71", "46"],
          ["L", "40–42", "102–107", "74", "48"],
          ["XL", "42–44", "107–112", "76", "50"],
          ["XXL", "44–46", "112–117", "79", "52"],
        ],
      },
    ],
    measure: [
      { label: "Chest", text: "Measure around the fullest part of your chest, under the arms, keeping the tape level." },
      { label: "Length", text: "From the highest point of the shoulder down to the hem." },
    ],
  },
};

const BOTTOM_TYPES = ["trouser", "jeans", "bottoms", "pants", "shorts", "joggers"];

// Women's shoes open on the Women tab; everything else opens on the first table.
function defaultTab(product: Product) {
  return product.categoryId === "shoes" && /^wom/i.test(product.subcategory ?? "") ? 1 : 0;
}

function chartFor(product: Product, sizes: string[]) {
  if (product.categoryId === "shoes") return charts.shoes;
  if (!["men", "women", "unisex"].includes(product.categoryId)) return null;
  const type = product.subcategory ?? "";
  const waistSizes = sizes.length > 0 && sizes.every((size) => /^\d{2}$/.test(size.trim()));
  if (waistSizes || BOTTOM_TYPES.some((item) => sameType(type, item))) return charts.bottoms;
  return charts.tops;
}

function SizeChartModal({
  chart,
  sizes,
  initialTab,
  onClose,
}: {
  chart: Chart;
  sizes: string[];
  initialTab: number;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(Math.min(initialTab, chart.tables.length - 1));
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const offered = new Set(sizes.map((size) => size.trim().toLowerCase()));

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={chart.title}>
      <button type="button" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-label="Close size chart" />
      <div className="animate-scale-in relative z-10 max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-[0_24px_80px_rgba(11,11,11,0.22)] sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Find your fit</p>
            <h2 className="mt-1.5 text-xl font-semibold text-[var(--foreground)]">{chart.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--accent)] transition hover:bg-[var(--sage-tint)]"
            aria-label="Close size chart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {chart.tables.length > 1 ? (
          <div className="mt-5 inline-flex rounded-full bg-[var(--sage-tint)] p-1" role="tablist">
            {chart.tables.map((table, index) => (
              <button
                key={table.label}
                type="button"
                role="tab"
                aria-selected={index === tab}
                onClick={() => setTab(index)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition ${
                  index === tab ? "bg-[var(--accent)] text-white shadow" : "text-[var(--accent)] hover:bg-white/60"
                }`}
              >
                {table.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className={`${chart.tables.length > 1 ? "mt-3" : "mt-5"} overflow-x-auto rounded-2xl border border-[#eadfe4]`}>
          <table className="w-full min-w-[20rem] border-collapse text-center text-sm">
            <thead>
              <tr className="bg-[var(--accent)] text-white">
                {chart.columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.tables[tab].rows.map((row) => {
                const available = offered.has(row[chart.keyColumn].toLowerCase());
                return (
                  <tr key={row[0]} className={`border-t border-[#f0e8ec] ${available ? "bg-[var(--sage-tint)]/70" : "odd:bg-white even:bg-[var(--background)]"}`}>
                    {row.map((cell, index) => (
                      <td
                        key={`${row[0]}-${index}`}
                        className={`px-3 py-2.5 tabular-nums ${index === chart.keyColumn ? "font-semibold text-[var(--accent)]" : "text-[var(--foreground)]"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {offered.size > 0 ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="inline-block h-3 w-3 rounded bg-[var(--sage-tint)]" aria-hidden="true" />
            Highlighted rows are the sizes this product comes in.
          </p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {chart.measure.map((item) => (
            <div key={item.label} className="rounded-2xl bg-[var(--background)] p-4">
              <p className="text-sm font-semibold text-[var(--accent)]">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-[var(--muted)]">
          Sizes can vary slightly between brands. Still unsure? Message us on WhatsApp and we will help you choose.
        </p>
      </div>
    </div>,
    document.body
  );
}

export function SizeChartButton({ product, sizes }: { product: Product; sizes: string[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const chart = chartFor(product, sizes);
  if (!chart) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2.5 rounded-full border border-[#eadfe4] bg-[#faf6f8] py-1.5 pl-1.5 pr-4 text-sm text-[var(--accent)] transition hover:border-[var(--accent)]/30 hover:bg-[var(--sage-tint)] hover:shadow-[0_6px_18px_rgba(11,11,11,0.10)]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8.5h18v7H3v-7Zm4 0v3m3.5-3v2m3.5-2v3m3.5-3v2" />
          </svg>
        </span>
        <span className="font-semibold">Size chart</span>
        <span className="hidden text-[var(--muted)] min-[380px]:inline">· Find your perfect fit</span>
        <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l6 6-6 6" />
        </svg>
      </button>
      {open ? <SizeChartModal chart={chart} sizes={sizes} initialTab={defaultTab(product)} onClose={close} /> : null}
    </>
  );
}
