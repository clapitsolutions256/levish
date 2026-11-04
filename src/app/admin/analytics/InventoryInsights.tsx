"use client";

import Link from "next/link";
import { useGetInventoryAnalyticsQuery } from "@/store/ordersApi";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function Stat({ label, value, note, tone = "gray" }: { label: string; value: string | number; note?: string; tone?: "gray" | "red" | "amber" | "green" }) {
  const tones = {
    gray: "text-gray-900",
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-emerald-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${tones[tone]}`}>{value}</p>
      {note ? <p className="text-xs text-gray-400 mt-1">{note}</p> : null}
    </div>
  );
}

function Thumb({ src, name }: { src: string; name: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-400">
      {name.charAt(0)}
    </span>
  );
}

function Panel({ title, children, hint }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {hint ? <p className="text-xs text-gray-400 mt-0.5">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="px-5 py-6 text-sm text-gray-400">{text}</p>;
}

export function InventoryInsights() {
  const { data, isLoading, isError } = useGetInventoryAnalyticsQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-pulse">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <p className="mb-8 text-sm text-red-600">Could not load inventory insights.</p>;
  }

  const { summary } = data;
  const maxTypeSold = Math.max(1, ...data.byType.map((type) => type.sold));

  return (
    <section className="mb-10">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Inventory & products</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Stat label="Total products" value={summary.totalProducts} note={`${summary.activeProducts} visible in store`} />
        <Stat
          label="Units in stock"
          value={summary.unitsInStock.toLocaleString()}
          note={summary.untrackedProducts ? `${summary.untrackedProducts} products without sizes not counted` : "Across every size and color"}
        />
        <Stat label="Stock value" value={formatPrice(summary.stockValue)} note="Units in stock × price" />
        <Stat
          label="Units sold"
          value={summary.unitsSold.toLocaleString()}
          note={`${summary.unitsSoldRecent.toLocaleString()} in the last ${data.recentDays} days`}
          tone="green"
        />
        <Stat label="Out of stock" value={summary.outOfStock} note="Products with no units left" tone={summary.outOfStock ? "red" : "gray"} />
        <Stat
          label="Low stock"
          value={summary.lowStock}
          note={`Sizes with ${data.lowStockLimit} or fewer left`}
          tone={summary.lowStock ? "amber" : "gray"}
        />
        <Stat label="Hot sellers" value={data.hotSelling.length} note={`Sold in the last ${data.recentDays} days`} />
        <Stat label="Slow movers" value={data.slowMovers.length} note={`In stock, no sales in ${data.recentDays} days`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="🔥 Hot selling" hint={`Most units sold in the last ${data.recentDays} days`}>
          {data.hotSelling.length ? (
            <ul className="divide-y divide-gray-100">
              {data.hotSelling.map((product, index) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 text-sm font-semibold text-gray-400">{index + 1}</span>
                  <Thumb src={product.image} name={product.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">
                      {product.stockLeft === null ? "Stock not tracked" : `${product.stockLeft} left in stock`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{product.recentQty} sold</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.recentRevenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text={`No sales in the last ${data.recentDays} days yet.`} />
          )}
        </Panel>

        <Panel title="Low stock alerts" hint={`Sizes with ${data.lowStockLimit} or fewer units left`}>
          {data.lowStock.length ? (
            <ul className="divide-y divide-gray-100">
              {data.lowStock.map((item) => (
                <li key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-3 px-5 py-3">
                  <Thumb src={item.image} name={item.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">{item.stock} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Nothing is running low." />
          )}
        </Panel>

        <Panel title="Sales & stock by type" hint="Units sold (all time) and units still in stock">
          {data.byType.length ? (
            <div className="space-y-3 px-5 py-4">
              {data.byType.map((type) => (
                <div key={type.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-gray-900">{type.name}</span>
                    <span className="text-xs text-gray-500">
                      <b className="text-gray-900">{type.sold}</b> sold · {type.inStock} in stock · {formatPrice(type.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(2, (type.sold / maxTypeSold) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No products yet." />
          )}
        </Panel>

        <Panel title="Slow movers" hint={`In stock and visible, but no sales in the last ${data.recentDays} days`}>
          {data.slowMovers.length ? (
            <ul className="divide-y divide-gray-100">
              {data.slowMovers.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <Thumb src={product.image} name={product.name} />
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{product.name}</p>
                  <span className="text-xs text-gray-500">{product.stock} in stock</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty text="Every product in stock has sold recently." />
          )}
        </Panel>
      </div>

      {data.outOfStock.length ? (
        <div className="mt-6">
          <Panel title="Out of stock" hint="Restock these or hide them from the store">
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
              {data.outOfStock.map((product) => (
                <li key={product.id} className="flex items-center gap-3 bg-white px-5 py-3">
                  <Thumb src={product.image} name={product.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-red-600">{product.active ? "Visible · Sold out" : "Hidden"}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-100 px-5 py-3 text-right">
              <Link href="/admin/products" className="text-sm font-medium text-amber-600 hover:underline">
                Manage products →
              </Link>
            </div>
          </Panel>
        </div>
      ) : null}
    </section>
  );
}
