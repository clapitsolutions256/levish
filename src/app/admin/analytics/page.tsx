"use client";

import { useGetAnalyticsQuery, useGetStatsQuery } from "@/store/ordersApi";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function BarChart({
  data,
  labelKey,
  valueKey,
  color,
}: {
  data: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color: string;
}) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400">No data</p>;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0));

  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const value = Number(d[valueKey]) || 0;
        const pct = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-28 truncate text-right">
              {String(d[labelKey])}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className={`h-full ${color} rounded-full flex items-center justify-end px-2 transition-all duration-500`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              >
                <span className="text-[10px] font-bold text-white">
                  {typeof value === "number" && value > 100
                    ? formatPrice(value)
                    : value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useGetAnalyticsQuery();
  const { data: stats } = useGetStatsQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="h-64 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Revenue, products, and location insights
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatPrice(stats.revenue)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalOrders}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Avg Order Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalOrders > 0
                ? formatPrice(Math.round(stats.revenue / stats.totalOrders))
                : "Rs. 0"}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
          Daily Revenue (Last 30 Days)
        </h2>
        {analytics?.daily && analytics.daily.length > 0 ? (
          <div className="flex items-end gap-1 h-48">
            {analytics.daily.map((d) => {
              const max = Math.max(...analytics.daily.map((x) => x.revenue));
              const pct = max > 0 ? (d.revenue / max) * 100 : 0;
              return (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {d._id}: {formatPrice(d.revenue)} ({d.orders} orders)
                  </div>
                  <div
                    className="w-full bg-amber-400 hover:bg-amber-500 rounded-t transition-all cursor-pointer min-h-[2px]"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No revenue data for the last 30 days</p>
        )}
        {analytics?.daily && analytics.daily.length > 0 && (
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{analytics.daily[0]?._id}</span>
            <span>{analytics.daily[analytics.daily.length - 1]?._id}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
            Top Products by Quantity
          </h2>
          <BarChart
            data={(analytics?.topProducts || []) as unknown as Record<string, unknown>[]}
            labelKey="_id"
            valueKey="totalQty"
            color="bg-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
            Top Cities by Orders
          </h2>
          <BarChart
            data={(analytics?.topCities || []) as unknown as Record<string, unknown>[]}
            labelKey="_id"
            valueKey="orders"
            color="bg-emerald-500"
          />
        </div>
      </div>

      {analytics?.topProducts && analytics.topProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mt-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Product Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Qty Sold</th>
                  <th className="px-5 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {analytics.topProducts.map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{p._id}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{p.totalQty}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatPrice(p.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
