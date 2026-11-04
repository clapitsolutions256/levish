"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { galleryFor } from "@/lib/variants";
import { useApplyPromoMutation, usePlaceOrderMutation, type AppliedPromo } from "@/store/checkoutApi";
import { promoDiscount } from "@/lib/sale";
import { SHIPPING_THRESHOLD, shippingFor } from "@/lib/shipping";
import { readCustomerSession } from "@/lib/customerSession";
import { useGetAccountQuery, useUpdateAccountMutation } from "@/store/accountApi";
import { bankTransfer } from "@/data/payment";
import { identifyMetaUser, trackAddPaymentInfo, trackInitiateCheckout, trackPurchase, type MetaContent } from "@/lib/metaPixel";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString()}`;
}


type PaymentMethod = "transfer" | "cod";

export default function CheckoutPage() {
  const { items, itemCount, total, clearCart, ready } = useCart();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paidTotal, setPaidTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");

  const [placeOrder, { isLoading: loading }] = usePlaceOrderMutation();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyPromo, { isLoading: applyingPromo }] = useApplyPromoMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const { data: account } = useGetAccountQuery(undefined, { skip: !sessionToken });

  useEffect(() => {
    const session = readCustomerSession();
    if (session) {
      setSessionToken(session.token);
      setEmail(session.email);
      const [savedFirst, ...savedRest] = session.name.split(" ");
      setFirstName((current) => current || savedFirst || "");
      setLastName((current) => current || savedRest.join(" "));
    }
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    const user = account?.user;
    if (!user) return;
    if (user.email) setEmail(user.email);
    if (user.firstName) setFirstName(user.firstName);
    if (user.lastName) setLastName(user.lastName);
    if (user.address) setAddress(user.address);
    if (user.apartment) setApartment(user.apartment);
    if (user.city) setCity(user.city);
    if (user.state) setStateName(user.state);
    if (user.postalCode) setPostalCode(user.postalCode);
    if (user.phone) setPhone(user.phone);
  }, [account]);

  const shippingCost = shippingFor(total);
  const discount = promo ? promoDiscount(promo, total) : 0;
  const orderTotal = total - discount + shippingCost;

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setPromoError("");
    try {
      const result = await applyPromo({
        code,
        email,
        phone,
        orderItems: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      }).unwrap();
      setPromo(result);
      setPromoInput("");
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setPromoError(error?.data?.error || "Could not apply this code. Please try again.");
    }
  };
  const checkoutStarted = useRef(false);
  const paymentTracked = useRef(false);
  const metaContents = useMemo<MetaContent[]>(
    () =>
      items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        item_price: item.product.price,
      })),
    [items]
  );

  useEffect(() => {
    if (!ready || placed || metaContents.length === 0 || checkoutStarted.current) return;
    checkoutStarted.current = true;
    trackInitiateCheckout(metaContents, orderTotal);
  }, [ready, placed, metaContents, orderTotal]);

  useEffect(() => {
    if (!email.includes("@")) return;
    identifyMetaUser({
      email,
      phone,
      firstName,
      lastName,
      city,
      state: stateName,
      postalCode,
      externalId: account?.user?.id,
    });
  }, [email, phone, firstName, lastName, city, stateName, postalCode, account?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const orderData = {
      email,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state: stateName,
      postalCode,
      phone,
      orderItems: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        variant: item.color || item.product.color || "",
        color: item.color || "",
        price: item.product.price,
        quantity: item.quantity,
        size: item.size || "",
        image: galleryFor(item.product, item.color)[0] || item.product.image,
      })),
      subtotal: total,
      shipping: shippingCost === 0 ? "Free" : `Rs. ${shippingCost}`,
      total: orderTotal,
      paymentMethod,
      promoCode: promo?.code,
    };

    try {
      if (!paymentTracked.current) {
        paymentTracked.current = true;
        trackAddPaymentInfo(metaContents, orderTotal);
      }
      const result = await placeOrder(orderData).unwrap();
      trackPurchase(result.orderId, metaContents, orderTotal);
      if (sessionToken) {
        await updateAccount({
          firstName,
          lastName,
          address,
          apartment,
          city,
          state: stateName,
          postalCode,
          phone,
        })
          .unwrap()
          .catch(() => undefined);
      }
      setOrderId(result.orderId);
      setPaidTotal(result.total);
      await clearCart();
      setPlaced(true);
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setApiError(error?.data?.error || "Failed to place order. Please try again.");
    }
  };

  if (!ready && items.length === 0 && !placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--muted)]">Loading your cart…</p>
      </div>
    );
  }

  if (items.length === 0 && !placed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="section-heading">Your cart is empty</h1>
        <p className="type-copy mt-2 text-[var(--muted)]">
          Add items to your cart to checkout.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 skeuo-ink font-medium rounded-full"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-fade-up">
        <div className="inline-flex w-16 h-16 rounded-full bg-[var(--sage-tint)] text-[var(--sage-deep)] items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="section-heading">Order placed</h1>
        <p className="type-copy mt-2 text-[var(--muted)]">
          Thank you. We&apos;ll send a confirmation to your email shortly.
        </p>
        {orderId && (
          <p className="mt-1 text-sm text-[var(--muted)]">
            Order ID: <span className="font-mono text-[var(--foreground)]">{orderId}</span>
          </p>
        )}
        {paymentMethod === "transfer" && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left text-sm leading-6">
            <p className="font-semibold text-[var(--foreground)]">Pay {formatPrice(paidTotal)} by online transfer</p>
            <p className="mt-2 text-[var(--muted)]">
              {bankTransfer.bank}
              <br />
              Account title: <span className="text-[var(--foreground)]">{bankTransfer.accountTitle}</span>
              <br />
              Account number: <span className="font-mono tracking-wider text-[var(--foreground)] select-all">{bankTransfer.accountNumber}</span>
            </p>
            <p className="mt-3 text-[var(--muted)]">
              Send the screenshot to{" "}
              <a href={bankTransfer.screenshotHref} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                {bankTransfer.screenshotTo}
              </a>{" "}
              on WhatsApp, and tell us you paid by online transfer when we call to confirm. You&apos;ll get {bankTransfer.cashbackPercent}% cashback.
            </p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          {orderId && (
            <Link
              href={`/order/${orderId}`}
              className="inline-block px-6 py-3 skeuo-ink font-medium rounded-full"
            >
              View order details
            </Link>
          )}
          <Link
            href="/"
            className="inline-block px-6 py-3 skeuo-ink font-medium rounded-full"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-[var(--muted)] mb-6 animate-fade-up">
        <Link href="/cart" className="hover:text-[var(--accent)]">Cart</Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--foreground)]">Checkout</span>
      </nav>
      <h1 className="section-heading mb-8 animate-fade-up">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8 animate-fade-up animation-delay-100">
            {/* Contact */}
            <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="section-heading mb-4">Contact</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                />
                {sessionChecked && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {sessionToken ? (
                      "You are signed in. This order is saved to your account."
                    ) : (
                      <>
                        Place this order as a guest, or{" "}
                        <Link href="/login" className="text-[var(--accent)] font-medium hover:text-[var(--accent-hover)]">
                          sign in
                        </Link>{" "}
                        to keep it on your account.
                      </>
                    )}
                  </p>
                )}
              </div>
            </section>

            {/* Delivery address */}
            <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="section-heading mb-4">Delivery address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[var(--foreground)] mb-1">First name</label>
                    <input id="firstName" name="firstName" type="text" required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="First name" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[var(--foreground)] mb-1">Last name</label>
                    <input id="lastName" name="lastName" type="text" required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)] mb-1">Address</label>
                  <input id="address" name="address" type="text" required autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Street address" />
                </div>
                <div>
                  <label htmlFor="address2" className="block text-sm font-medium text-[var(--foreground)] mb-1">Apartment, suite, etc. (optional)</label>
                  <input id="address2" name="address2" type="text" autoComplete="address-line2" value={apartment} onChange={(event) => setApartment(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Apt, floor, building" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-[var(--foreground)] mb-1">City</label>
                    <input id="city" name="city" type="text" required autoComplete="address-level2" value={city} onChange={(event) => setCity(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="City" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-[var(--foreground)] mb-1">State / Province</label>
                    <input id="state" name="state" type="text" autoComplete="address-level1" value={stateName} onChange={(event) => setStateName(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="State" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-[var(--foreground)] mb-1">Postal code</label>
                    <input id="postalCode" name="postalCode" type="text" autoComplete="postal-code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Postal code" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone</label>
                    <input id="phone" name="phone" type="tel" required autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="03XX XXXXXXX" />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing address */}
            <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="section-heading mb-4">Billing address</h2>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--foreground)]">Same as delivery address</span>
              </label>
              {!sameAsShipping && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billFirstName" className="block text-sm font-medium text-[var(--foreground)] mb-1">First name</label>
                      <input id="billFirstName" name="billFirstName" type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="First name" />
                    </div>
                    <div>
                      <label htmlFor="billLastName" className="block text-sm font-medium text-[var(--foreground)] mb-1">Last name</label>
                      <input id="billLastName" name="billLastName" type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Last name" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="billAddress" className="block text-sm font-medium text-[var(--foreground)] mb-1">Address</label>
                    <input id="billAddress" name="billAddress" type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="billCity" className="block text-sm font-medium text-[var(--foreground)] mb-1">City</label>
                      <input id="billCity" name="billCity" type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="City" />
                    </div>
                    <div>
                      <label htmlFor="billPostalCode" className="block text-sm font-medium text-[var(--foreground)] mb-1">Postal code</label>
                      <input id="billPostalCode" name="billPostalCode" type="text" className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" placeholder="Postal code" />
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Payment method & bank details */}
            <section className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="section-heading mb-4">Payment</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "cod" ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--muted)]"}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => { setPaymentMethod("cod"); if (!paymentTracked.current) { paymentTracked.current = true; trackAddPaymentInfo(metaContents, orderTotal); } }} className="sr-only" />
                    <span className="font-medium">Cash on delivery</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === "transfer" ? "border-[var(--accent)] bg-[var(--accent)]/5 text-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--muted)]"}`}>
                    <input type="radio" name="paymentMethod" value="transfer" checked={paymentMethod === "transfer"} onChange={() => { setPaymentMethod("transfer"); if (!paymentTracked.current) { paymentTracked.current = true; trackAddPaymentInfo(metaContents, orderTotal); } }} className="sr-only" />
                    <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M4 10h16M12 3l8 5H4l8-5zM6 10v8m4-8v8m4-8v8m4-8v8" /></svg>
                    <span className="font-medium">Online transfer</span>
                  </label>
                </div>

                {paymentMethod === "transfer" && (
                  <div className="pt-4 space-y-4 border-t border-[var(--border)]">
                    <dl className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm">
                      {[
                        ["Bank", bankTransfer.bank],
                        ["Account title", bankTransfer.accountTitle],
                        ["Account number", bankTransfer.accountNumber],
                      ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                          <dt className="text-[var(--muted)]">{label}</dt>
                          <dd className={`text-right font-medium text-[var(--foreground)] ${label === "Account number" ? "font-mono tracking-wider select-all" : ""}`}>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="rounded-xl bg-[var(--sage-tint)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
                      Get {bankTransfer.cashbackPercent}% cashback when you pay by online transfer.
                    </p>
                    <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-6 text-[var(--muted)]">
                      <li>Transfer the order total ({formatPrice(orderTotal)}) to the account above.</li>
                      <li>
                        Send a screenshot of the transfer to{" "}
                        <a href={bankTransfer.screenshotHref} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--accent)] underline-offset-4 hover:underline">
                          {bankTransfer.screenshotTo}
                        </a>{" "}
                        on WhatsApp.
                      </li>
                      <li>When we call to confirm your order, tell us you paid by online transfer.</li>
                    </ol>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Order summary + Pay now */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] animate-fade-up animation-delay-200">
              <h2 className="section-heading mb-4">Order summary</h2>
              <ul className="space-y-4 max-h-56 overflow-y-auto">
                {items.map((item) => (
                  <li key={`${item.product.id}-${item.size ?? ""}-${item.color ?? ""}`} className="flex gap-3 border-b border-[var(--border)] pb-4 last:border-0">
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-[var(--cream)] shrink-0">
                      <Image src={galleryFor(item.product, item.color)[0] || item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                      <span className="absolute bottom-0 right-0 bg-[var(--foreground)] text-[var(--cream)] text-[10px] w-5 h-5 flex items-center justify-center rounded-tl">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-[var(--muted)]">{item.color || item.product.color}{item.size && ` · ${item.size}`}</p>
                      <p className="text-sm font-medium mt-0.5">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                {promo ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--sage-deep)]/40 bg-[var(--sage-tint)] px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                      <svg className="h-4 w-4 shrink-0 text-[var(--sage-deep)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M7 7h.01M3 11.2V5a2 2 0 0 1 2-2h6.2a2 2 0 0 1 1.4.6l8.2 8.2a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0l-8.2-8.2a2 2 0 0 1-.6-1.4Z" />
                      </svg>
                      <span className="font-mono font-semibold text-[var(--accent)]">{promo.code}</span>
                      <span className="truncate text-[var(--muted)]">
                        {promo.type === "percent" ? `${promo.value}% off applied` : `${formatPrice(promo.value)} off applied`}
                      </span>
                    </div>
                    <button type="button" onClick={() => setPromo(null)} className="shrink-0 text-xs font-medium text-[var(--accent)] hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="promoCode" className="block text-sm font-medium text-[var(--foreground)] mb-1">Promo code</label>
                    <div className="flex gap-2">
                      <input
                        id="promoCode"
                        type="text"
                        autoComplete="off"
                        autoCapitalize="characters"
                        value={promoInput}
                        onChange={(event) => {
                          setPromoInput(event.target.value.toUpperCase());
                          setPromoError("");
                        }}
                        onKeyDown={(event) => {
                          // Enter applies the code instead of placing the order.
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        className="input-warm min-w-0 flex-1 !py-2.5 font-mono uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim() || applyingPromo}
                        className="skeuo-ink shrink-0 rounded-full px-5 text-sm font-medium disabled:opacity-50"
                      >
                        {applyingPromo ? "Checking…" : "Apply"}
                      </button>
                    </div>
                    {promoError ? <p className="mt-2 text-xs text-red-700">{promoError}</p> : null}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Discount ({promo?.code})</span>
                    <span className="font-medium text-[var(--sage-deep)]">- {formatPrice(discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-[var(--muted)]">Free shipping on orders over Rs. {SHIPPING_THRESHOLD.toLocaleString()}</p>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>
              {apiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {apiError}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 skeuo-ink font-medium rounded-full disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing…" : "Place order"}
              </button>
              <Link href="/cart" className="block mt-4 text-center text-sm text-[var(--accent)] hover:underline">Back to cart</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
