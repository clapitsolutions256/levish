"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { clearCustomerSession, readCustomerSession, saveCustomerSession } from "@/lib/customerSession";
import { Skeleton } from "@/components/Skeleton";
import { useChangePasswordMutation, useGetAccountQuery, useUpdateAccountMutation } from "@/store/accountApi";
import { apiError } from "@/store/apiError";

function formatPrice(price: number) {
  return `Rs. ${Number(price).toLocaleString("en-PK")}`;
}

const statusLabel: Record<string, string> = {
  pending: "Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function AccountView() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { data, isLoading, isFetching, isUninitialized, error } = useGetAccountQuery(undefined, { skip: !sessionReady });
  const [updateAccount, { isLoading: savingDetails }] = useUpdateAccountMutation();
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation();
  const orders = data?.orders ?? [];
  const loading = !sessionReady || isLoading;
  const filled = useRef(false);

  useEffect(() => {
    const session = readCustomerSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setEmail(session.email);
    const [savedFirst, ...savedRest] = session.name.split(" ");
    setFirstName(savedFirst || "");
    setLastName(savedRest.join(" "));
    setSessionReady(true);
  }, [router]);

  useEffect(() => {
    if (!sessionReady || isUninitialized || isLoading || isFetching || data) return;
    if (error && typeof error === "object" && "status" in error && error.status === 401) {
      clearCustomerSession();
      router.replace("/login");
    }
  }, [sessionReady, isUninitialized, isLoading, isFetching, data, error, router]);

  useEffect(() => {
    const user = data?.user;
    if (!user || filled.current) return;
    filled.current = true;
    if (user.firstName || user.lastName) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
    setAddress(user.address || "");
    setApartment(user.apartment || "");
    setCity(user.city || "");
    setStateName(user.state || "");
    setPostalCode(user.postalCode || "");
    setPhone(user.phone || "");
  }, [data]);

  async function saveDetails(event: React.FormEvent) {
    event.preventDefault();
    const session = readCustomerSession();
    if (!session) return;
    setDetailsError("");
    setDetailsMessage("");
    try {
      const data = await updateAccount({
        firstName,
        lastName,
        address,
        apartment,
        city,
        state: stateName,
        postalCode,
        phone,
      }).unwrap();
      saveCustomerSession({ ...session, name: data.user.name });
      setDetailsMessage("Details saved. Checkout will use these next time.");
    } catch (err) {
      setDetailsError(apiError(err, "Could not save your details."));
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    const session = readCustomerSession();
    if (!session) return;
    setPasswordError("");
    setPasswordMessage("");
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password updated.");
    } catch (err) {
      setPasswordError(apiError(err, "Could not update the password."));
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8" aria-busy="true" aria-label="Loading your account">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28 rounded" />
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-4 w-56 rounded" />
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">
      <div>
        <p className="eyebrow mb-2">Your account</p>
        <h1 className="section-heading">Profile</h1>
        <p className="text-sm text-[var(--muted)] mt-2">{email}</p>
      </div>

      <section className="card-warm p-6 md:p-8">
        <h2 className="section-heading mb-1">Delivery details</h2>
        <p className="type-copy mb-4 text-[var(--muted)]">These details fill in automatically at checkout.</p>
        <form className="space-y-4" onSubmit={saveDetails}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1.5">First name</label>
              <input id="firstName" className="input-warm" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">Last name</label>
              <input id="lastName" className="input-warm" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1.5">Address</label>
            <input id="address" className="input-warm" value={address} onChange={(event) => setAddress(event.target.value)} required />
          </div>
          <div>
            <label htmlFor="apartment" className="block text-sm font-medium mb-1.5">Apartment, suite, etc. (optional)</label>
            <input id="apartment" className="input-warm" value={apartment} onChange={(event) => setApartment(event.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1.5">City</label>
              <input id="city" className="input-warm" value={city} onChange={(event) => setCity(event.target.value)} required />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1.5">State / Province</label>
              <input id="state" className="input-warm" value={stateName} onChange={(event) => setStateName(event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium mb-1.5">Postal code</label>
              <input id="postalCode" className="input-warm" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1.5">Phone</label>
              <input id="phone" className="input-warm" value={phone} onChange={(event) => setPhone(event.target.value)} required placeholder="03XX XXXXXXX" />
            </div>
          </div>
          {detailsError ? <p className="text-sm text-red-700">{detailsError}</p> : null}
          {detailsMessage ? <p className="text-sm text-[var(--foreground)]">{detailsMessage}</p> : null}
          <button type="submit" className="btn-primary" disabled={savingDetails}>
            {savingDetails ? "Saving…" : "Save details"}
          </button>
        </form>
      </section>

      <section className="card-warm p-6 md:p-8">
        <h2 className="section-heading mb-4">Password</h2>
        <form className="space-y-4" onSubmit={savePassword}>
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium mb-1.5">Current password</label>
            <PasswordField
              id="current-password"
              name="currentPassword"
              autoComplete="current-password"
              placeholder="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium mb-1.5">New password</label>
            <PasswordField
              id="new-password"
              name="newPassword"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={setNewPassword}
            />
          </div>
          {passwordError ? <p className="text-sm text-red-700">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-sm text-[var(--foreground)]">{passwordMessage}</p> : null}
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? "Saving…" : "Change password"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-heading mb-4">Order history</h2>
        {orders.length === 0 ? (
          <div className="card-warm p-8 text-center">
            <p className="type-copy text-[var(--muted)]">You have not placed an order yet.</p>
            <Link href="/" className="inline-block mt-4 text-sm font-medium text-[var(--accent)]">Continue shopping</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id} className="card-warm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">Order #{order._id.slice(-6)}</p>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[#4a142a]">
                    {statusLabel[order.status] ?? order.status}
                  </p>
                </div>
                <ul className="mt-4 divide-y divide-[var(--border)]">
                  {order.orderItems.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex items-center gap-3 py-3 first:pt-0">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--cream)]">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" loading="eager" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {[item.variant, item.size ? `Size ${item.size}` : "", `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3 text-sm">
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Shipping</span>
                    <span>{order.shipping}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <Link href={`/order/${order._id}`} className="inline-block mt-3 text-sm font-medium text-[var(--accent)]">
                  Track order
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
