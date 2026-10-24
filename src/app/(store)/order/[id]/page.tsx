"use client";

import { use } from "react";
import Link from "next/link";
import { useGetOrderQuery } from "@/store/checkoutApi";

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

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const statusColors: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-600 bg-blue-50 border-blue-200",
  processing: "text-indigo-600 bg-indigo-50 border-indigo-200",
  shipped: "text-purple-600 bg-purple-50 border-purple-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  cancelled: "text-red-600 bg-red-50 border-red-200",
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, error } = useGetOrderQuery(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--border)] rounded w-64" />
          <div className="h-4 bg-[var(--border)] rounded w-40" />
          <div className="h-32 bg-[var(--border)] rounded-2xl" />
          <div className="h-48 bg-[var(--border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <svg className="w-16 h-16 text-[#4a142a] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="section-heading">Order not found</h1>
        <p className="mt-2 text-[var(--muted)] text-sm">
          We couldn&apos;t find an order with this ID. Please check and try again.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-[#4a142a] text-white font-medium rounded-lg hover:bg-[#350e1e] transition"
        >
          Go to homepage
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-[var(--muted)] mb-6 animate-fade-up">
        <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--foreground)]">Order #{order._id.slice(-6)}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 animate-fade-up">
        <div>
          <h1 className="section-heading">
            Order #{order._id.slice(-6)}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${
            statusColors[order.status] || "text-gray-600 bg-gray-50 border-gray-200"
          }`}
        >
          {order.status}
        </span>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] mb-6 animate-fade-up animation-delay-100">
          <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wider mb-6">
            Order Progress
          </h2>
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        done
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--border)] text-[var(--muted)]"
                      } ${isCurrent ? "ring-4 ring-[var(--accent)]/20" : ""}`}
                    >
                      {done ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[11px] font-medium text-center ${done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-6 rounded ${i < currentStep ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isCancelled && (
        <section className="bg-red-50 rounded-2xl p-6 border border-red-200 mb-6 animate-fade-up animation-delay-100">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p className="font-semibold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-600">This order has been cancelled.</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Delivery address */}
        <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] animate-fade-up animation-delay-100">
          <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wider mb-3">
            Delivery Address
          </h2>
          <div className="text-sm space-y-1">
            <p className="font-medium text-[var(--foreground)]">
              {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
            </p>
            <p className="text-[var(--muted)]">{order.deliveryAddress.address}</p>
            {order.deliveryAddress.apartment && (
              <p className="text-[var(--muted)]">{order.deliveryAddress.apartment}</p>
            )}
            <p className="text-[var(--muted)]">
              {order.deliveryAddress.city}
              {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
              {order.deliveryAddress.postalCode && ` ${order.deliveryAddress.postalCode}`}
            </p>
            <p className="text-[var(--muted)]">{order.deliveryAddress.phone}</p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] animate-fade-up animation-delay-200">
          <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wider mb-3">
            Contact
          </h2>
          <div className="text-sm space-y-2">
            <div>
              <span className="text-[var(--muted)]">Email</span>
              <p className="font-medium text-[var(--foreground)]">{order.contact.email}</p>
            </div>
            <div>
              <span className="text-[var(--muted)]">Phone</span>
              <p className="font-medium text-[var(--foreground)]">{order.deliveryAddress.phone}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Order items */}
      <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] animate-fade-up animation-delay-200">
        <h2 className="font-semibold text-sm text-[var(--muted)] uppercase tracking-wider mb-4">
          Items
        </h2>
        <div className="divide-y divide-[var(--border)]">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[var(--cream)] flex items-center justify-center text-[#4a142a]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.variant}
                    {item.size && ` · Size: ${item.size}`}
                    {" · "}Qty: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Shipping</span>
            <span>{order.shipping}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[var(--border)]">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      {/* Order ID footer */}
      <div className="mt-6 text-center text-xs text-[var(--muted)] animate-fade-up animation-delay-200">
        <p>Order ID: <span className="font-mono">{order._id}</span></p>
        {order.updatedAt && <p className="mt-1">Last updated: {formatDate(order.updatedAt)}</p>}
      </div>

      <div className="mt-8 text-center animate-fade-up animation-delay-200">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#4a142a] text-white font-medium rounded-lg hover:bg-[#350e1e] transition"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
