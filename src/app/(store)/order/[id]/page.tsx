import Image from "next/image";
import Link from "next/link";
import { getOrder, isUuid } from "@/lib/orders";
import { hasCurrentPhoto } from "@/lib/cartToken";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const STATUS_STEPS = [
  { key: "pending", label: "Order placed", text: "We have received your order." },
  { key: "confirmed", label: "Confirmed", text: "We called you and confirmed it." },
  { key: "processing", label: "Packing", text: "Your order is being packed." },
  { key: "shipped", label: "On the way", text: "Your parcel is with the courier." },
  { key: "delivered", label: "Delivered", text: "Your parcel has been delivered." },
];

const statusColors: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-700 bg-blue-50 border-blue-200",
  processing: "text-indigo-700 bg-indigo-50 border-indigo-200",
  shipped: "text-purple-700 bg-purple-50 border-purple-200",
  delivered: "text-green-700 bg-green-50 border-green-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
};

function Tick() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="section-heading">Order not found</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">We couldn&apos;t find an order with this ID. Please check and try again.</p>
      <Link href="/" className="mt-6 inline-block rounded-full px-6 py-3 font-medium skeuo-ink">
        Go to homepage
      </Link>
    </div>
  );
}

// Rendered on the server, so the order shows straight away with no loading step on the phone.
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = isUuid(id) ? await getOrder(id).catch(() => null) : null;
  if (!order) return <NotFound />;

  const currentStep = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "cancelled";
  const statusLabel = isCancelled ? "Cancelled" : (STATUS_STEPS[currentStep]?.label ?? order.status);
  const shortId = order._id.slice(-6).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="mb-5 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          Home
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--foreground)]">Order #{shortId}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="section-heading">Order #{shortId}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
            statusColors[order.status] || "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {isCancelled ? (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-700">Order cancelled</p>
          <p className="text-sm text-red-600">This order has been cancelled.</p>
        </section>
      ) : (
        <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Order progress</h2>

          {/* Phones: one step per line, top to bottom, so nothing has to squeeze side by side. */}
          <ol className="sm:hidden">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const last = i === STATUS_STEPS.length - 1;
              return (
                <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0">
                  {!last ? (
                    <span
                      className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${i < currentStep ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
                    } ${i === currentStep ? "ring-4 ring-[var(--accent)]/20" : ""}`}
                  >
                    {done ? <Tick /> : i + 1}
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className={`text-sm font-semibold ${done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{step.label}</p>
                    {i === currentStep ? <p className="mt-0.5 text-sm text-[var(--muted)]">{step.text}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Wider screens: the steps in one row. */}
          <ol className="hidden items-start sm:flex">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <li key={step.key} className="flex flex-1 items-start last:flex-none">
                  <div className="flex w-20 flex-col items-center gap-2">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        done ? "bg-[var(--accent)] text-white" : "bg-[var(--border)] text-[var(--muted)]"
                      } ${i === currentStep ? "ring-4 ring-[var(--accent)]/20" : ""}`}
                    >
                      {done ? <Tick /> : i + 1}
                    </span>
                    <span className={`text-center text-xs font-medium ${done ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>{step.label}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 ? (
                    <span className={`mt-5 h-0.5 flex-1 rounded ${i < currentStep ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} aria-hidden="true" />
                  ) : null}
                </li>
              );
            })}
          </ol>
          {currentStep >= 0 ? <p className="mt-5 hidden text-sm text-[var(--muted)] sm:block">{STATUS_STEPS[currentStep].text}</p> : null}
        </section>
      )}

      <section className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Delivering to</h2>
        <div className="space-y-1 break-words text-sm">
          <p className="font-medium text-[var(--foreground)]">
            {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
          </p>
          <p className="text-[var(--muted)]">
            {[order.deliveryAddress.address, order.deliveryAddress.apartment].filter(Boolean).join(", ")}
          </p>
          <p className="text-[var(--muted)]">
            {[order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.postalCode].filter(Boolean).join(", ")}
          </p>
          <p className="text-[var(--muted)]">{order.deliveryAddress.phone}</p>
          <p className="text-[var(--muted)]">{order.contact.email}</p>
        </div>
        <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm">
          <span className="text-[var(--muted)]">Payment: </span>
          <span className="font-medium text-[var(--foreground)]">{order.paymentMethod === "transfer" ? "Online transfer" : "Cash on delivery"}</span>
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">Items</h2>
        <ul className="divide-y divide-[var(--border)]">
          {order.orderItems.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--cream)]">
                {hasCurrentPhoto(item.image) ? <Image src={item.image!} alt="" fill className="object-cover" sizes="48px" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-[var(--foreground)]">{item.name}</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {[item.variant, item.size && `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[var(--foreground)]">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount ? (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Discount{order.promoCode ? ` (${order.promoCode})` : ""}</span>
              <span>- {formatPrice(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Shipping</span>
            <span>{order.shipping}</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-2 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </section>

      <p className="mt-6 break-all text-center text-xs text-[var(--muted)]">Order ID: {order._id}</p>

      <div className="mt-6 text-center">
        <Link href="/" className="inline-block rounded-full px-6 py-3 font-medium skeuo-ink">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
