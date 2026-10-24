"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
  useAddOrderNoteMutation,
  useDeleteOrderNoteMutation,
} from "@/store/ordersApi";
import { StatusBadge } from "@/components/admin/StatusBadge";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_FLOW = [
  { key: "pending", label: "Pending", color: "bg-yellow-400" },
  { key: "confirmed", label: "Confirmed", color: "bg-blue-400" },
  { key: "processing", label: "Processing", color: "bg-indigo-400" },
  { key: "shipped", label: "Shipped", color: "bg-purple-400" },
  { key: "delivered", label: "Delivered", color: "bg-green-400" },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading, error } = useGetOrderQuery(id);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddOrderNoteMutation();
  const [deleteNote] = useDeleteOrderNoteMutation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteText, setNoteText] = useState("");

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-32" />
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="h-48 bg-gray-100 rounded-xl" />
            <div className="h-48 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Order not found</p>
        <Link
          href="/admin/orders"
          className="text-sm text-amber-600 hover:underline mt-2 inline-block"
        >
          ← Back to orders
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus({ id: order._id, status: newStatus });
  };

  const handleDelete = async () => {
    await deleteOrder(order._id);
    router.push("/admin/orders");
  };

  const currentStep = STATUS_FLOW.findIndex((s) => s.key === order.status);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-gray-500 hover:text-amber-600 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4 text-[#4a142a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order._id.slice(-6)}
            <StatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on {formatDate(order.createdAt)}
            {order.updatedAt && (
              <span> · Updated {formatDate(order.updatedAt)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-sm text-red-700">Delete this order?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete order
            </button>
          )}
        </div>
      </div>

      {order.status !== "cancelled" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
            Order Progress
          </h2>
          <div className="flex items-center">
            {STATUS_FLOW.map((step, i) => {
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => handleStatusChange(step.key)}
                    disabled={isUpdating}
                    className={`flex flex-col items-center gap-1.5 group cursor-pointer ${
                      isUpdating ? "opacity-50" : ""
                    }`}
                    title={`Set to ${step.label}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done
                          ? `${step.color} text-white shadow-sm`
                          : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                      } ${isCurrent ? "ring-4 ring-offset-2 ring-amber-200" : ""}`}
                    >
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-xs font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </button>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${i < currentStep ? step.color : "bg-gray-100"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Update Status
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {isUpdating && <span className="text-sm text-gray-400">Updating…</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Customer</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm">
                {order.deliveryAddress.firstName.charAt(0)}
                {order.deliveryAddress.lastName.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
                </p>
                <p className="text-sm text-gray-500">{order.contact.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex gap-2 text-sm">
                <span className="text-gray-400 w-16">Phone</span>
                <span className="text-gray-900">{order.deliveryAddress.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Delivery Address</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
            <p>{order.deliveryAddress.address}</p>
            {order.deliveryAddress.apartment && <p>{order.deliveryAddress.apartment}</p>}
            <p>
              {order.deliveryAddress.city}
              {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
              {order.deliveryAddress.postalCode && ` ${order.deliveryAddress.postalCode}`}
            </p>
            <p className="text-gray-500">{order.deliveryAddress.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Order Items</h2>
        <div className="divide-y divide-gray-100">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-16 rounded-lg bg-[#4a142a]/10 overflow-hidden shrink-0 flex items-center justify-center text-[#4a142a]">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    {item.variant}
                    {item.size && ` · Size: ${item.size}`}
                    {" · "}Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span>{order.shipping}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Admin Notes</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!noteText.trim()) return;
            await addNote({ id: order._id, note: noteText });
            setNoteText("");
          }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <button
            type="submit"
            disabled={isAddingNote || !noteText.trim()}
            className="px-4 py-2.5 bg-[#4a142a] text-white text-sm font-medium rounded-lg hover:bg-[#350e1e] disabled:opacity-50 transition-colors"
          >
            {isAddingNote ? "Adding…" : "Add Note"}
          </button>
        </form>

        {order.notes && order.notes.length > 0 ? (
          <div className="space-y-3">
            {order.notes.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-800">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
                <button
                  onClick={() => deleteNote({ orderId: order._id, noteId: n._id })}
                  className="p-1 rounded text-[#4a142a] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                  title="Delete note"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No notes yet</p>
        )}
      </div>
    </div>
  );
}
