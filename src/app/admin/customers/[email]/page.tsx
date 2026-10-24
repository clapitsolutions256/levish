"use client";

import { use } from "react";
import Link from "next/link";
import { useGetCustomerQuery } from "@/store/ordersApi";
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

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = use(params);
  const decodedEmail = decodeURIComponent(email);
  const { data: customer, isLoading, error } = useGetCustomerQuery(decodedEmail);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-32" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Customer not found</p>
        <Link href="/admin/customers" className="text-sm text-amber-600 hover:underline mt-2 inline-block">
          ← Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <Link href="/admin/customers" className="text-sm text-gray-500 hover:text-amber-600 mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to customers
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 mt-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">
            {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phone</p>
            <p className="text-sm font-medium mt-1">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">City</p>
            <p className="text-sm font-medium mt-1">{customer.city}{customer.state && `, ${customer.state}`}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-sm font-bold mt-1 text-blue-600">{customer.totalOrders}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-sm font-bold mt-1 text-green-600">{formatPrice(customer.totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customer.orders.map((order) => (
                <tr key={order._id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${order._id}`} className="text-sm font-mono text-amber-600 hover:underline font-semibold">
                      #{order._id.slice(-6)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">
                    {order.orderItems.map((i) => i.name).join(", ")}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
