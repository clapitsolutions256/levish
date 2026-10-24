"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useBulkUpdateStatusMutation,
  useLazyExportOrdersQuery,
} from "@/store/ordersApi";
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

const ALL_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  const { data: orders, isLoading, isFetching } = useGetOrdersQuery({
    status: statusFilter,
    search: debouncedSearch,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] = useBulkUpdateStatusMutation();
  const [exportOrders] = useLazyExportOrdersQuery();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(timeout);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus({ id: orderId, status: newStatus });
  };

  const handleDelete = async (orderId: string) => {
    await deleteOrder(orderId);
    setDeleteConfirm(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!orders) return;
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map((o) => o._id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;
    await bulkUpdateStatus({ orderIds: Array.from(selectedOrders), status: bulkStatus });
    setSelectedOrders(new Set());
    setBulkStatus("");
  };

  const handleExport = async () => {
    const csv = await exportOrders({ status: statusFilter }).unwrap();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200">
            {orders?.length || 0} order{(orders?.length || 0) !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone, city…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? "bg-[#4a142a] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {selectedOrders.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-sm font-medium text-amber-800">
            {selectedOrders.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="text-sm rounded-lg border border-amber-300 bg-white px-2 py-1.5 focus:outline-none"
          >
            <option value="">Set status…</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || isBulkUpdating}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {isBulkUpdating ? "Updating…" : "Apply"}
          </button>
          <button
            onClick={() => setSelectedOrders(new Set())}
            className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Loading orders…</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 text-[#4a142a] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={orders.length > 0 && selectedOrders.size === orders.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-amber-50/30 transition-colors ${isFetching ? "opacity-60" : ""} ${
                      selectedOrders.has(order._id) ? "bg-amber-50/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order._id)}
                        onChange={() => toggleSelect(order._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${order._id}`} className="text-sm font-mono text-amber-600 hover:underline font-semibold">
                        #{order._id.slice(-6)}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">
                        {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{order.contact.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{order.deliveryAddress.city}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{order.orderItems.length}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={order.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="text-xs font-semibold capitalize rounded-lg border border-gray-200 bg-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="p-1.5 rounded-lg text-[#4a142a] hover:bg-[#4a142a]/10 transition-colors"
                          title="View details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {deleteConfirm === order._id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(order._id)} disabled={isDeleting} className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600">Confirm</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(order._id)} className="p-1.5 rounded-lg text-[#4a142a] hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete order">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
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
