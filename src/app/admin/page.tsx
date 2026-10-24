"use client";

import Link from "next/link";
import { useGetStatsQuery, useGetOrdersQuery } from "@/store/ordersApi";
import { StatusBadge } from "@/components/admin/StatusBadge";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statCards = [
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "bg-[#4a142a]",
    bg: "bg-[#4a142a]/10",
    text: "text-[#4a142a]",
  },
  {
    key: "revenue",
    label: "Total Revenue",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-[#4a142a]",
    bg: "bg-[#4a142a]/10",
    text: "text-[#4a142a]",
  },
  {
    key: "pending",
    label: "Pending",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-[#4a142a]",
    bg: "bg-[#4a142a]/10",
    text: "text-[#4a142a]",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
    color: "bg-[#4a142a]",
    bg: "bg-[#4a142a]/10",
    text: "text-[#4a142a]",
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery();
  const { data: orders, isLoading: ordersLoading } = useGetOrdersQuery({});

  const recentOrders = orders?.slice(0, 8) || [];

  function getStatValue(key: string): string {
    if (!stats) return "—";
    if (key === "totalOrders") return stats.totalOrders.toLocaleString();
    if (key === "revenue") return formatPrice(stats.revenue);
    if (key === "pending") return (stats.statusCounts?.pending || 0).toString();
    if (key === "delivered")
      return (stats.statusCounts?.delivered || 0).toString();
    return "—";
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your store performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
              <div
                className={`w-10 h-10 rounded-lg ${card.bg} ${card.text} flex items-center justify-center`}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? (
                <span className="inline-block w-20 h-7 bg-gray-100 rounded animate-pulse" />
              ) : (
                getStatValue(card.key)
              )}
            </p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
            Orders by Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <StatusBadge status={status} />
                <span className="text-sm font-semibold text-gray-700">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {ordersLoading ? (
          <div className="p-8 text-center text-gray-400">Loading orders…</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-sm font-mono text-amber-600 hover:underline"
                      >
                        #{order._id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium">
                        {order.deliveryAddress.firstName}{" "}
                        {order.deliveryAddress.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.contact.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {order.orderItems.length} item
                      {order.orderItems.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
