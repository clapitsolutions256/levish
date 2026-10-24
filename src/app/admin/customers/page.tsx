"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useGetCustomersQuery } from "@/store/ordersApi";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: customers, isLoading } = useGetCustomersQuery({
    search: debouncedSearch,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">
            All customers who placed orders
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
          {customers?.length || 0} customer
          {(customers?.length || 0) !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="relative max-w-md mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a142a]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading customers…</div>
        ) : !customers || customers.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-[#4a142a] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Total Spent</th>
                  <th className="px-5 py-3">Last Order</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                          {c.firstName?.charAt(0)}
                          {c.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{c._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.city}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {c.totalOrders}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {formatDate(c.lastOrder)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${encodeURIComponent(c._id)}`}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        View →
                      </Link>
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
