import { NextResponse, after } from "next/server";
import { getCustomer } from "@/lib/customerAuth";
import { reserveStock, restoreStock } from "@/lib/stock";
import { getSupabase } from "@/lib/supabase";
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/email";
import { PAUSED_NOTICE, PRODUCTS_PAUSED } from "@/lib/storeStatus";
import { checkPromo, cleanCode, serverSubtotal } from "@/lib/promo";
import { shippingFor } from "@/lib/shipping";
import { capiRequestContext, sendCapiPurchase } from "@/lib/metaCapi";

export async function POST(request: Request) {
  if (PRODUCTS_PAUSED) {
    return NextResponse.json({ error: `${PAUSED_NOTICE.title}. ${PAUSED_NOTICE.text}` }, { status: 507 });
  }
  try {
    const customer = await getCustomer(request);
    const {
      email, firstName, lastName, address, apartment,
      city, state, postalCode, phone, orderItems,
      subtotal, shipping, total, paymentMethod, promoCode,
    } = await request.json();

    // Checkout asks for full name, phone, full address and city. Email is optional: guests leave it out,
    // signed-in customers send their account email so the order lands on their account.
    if (!String(firstName ?? "").trim() || !String(address ?? "").trim() || !String(city ?? "").trim() || !String(phone ?? "").trim()) {
      return NextResponse.json({ error: "Please fill in your name, phone number, address and city." }, { status: 400 });
    }
    const cleanEmail = String(email ?? "").trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // A promo order is priced entirely on the server, so the discount cannot be faked.
    let priced = { subtotal: Number(subtotal), shipping: shipping || "Free", total: Number(total) };
    let promo: { promo_code: string; discount: number } | null = null;
    if (cleanCode(promoCode)) {
      const realSubtotal = await serverSubtotal(orderItems);
      if (realSubtotal === null) {
        return NextResponse.json({ error: "Your cart has changed. Please refresh the page." }, { status: 400 });
      }
      const result = await checkPromo({ code: promoCode, subtotal: realSubtotal, email: cleanEmail, phone });
      if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
      const fee = shippingFor(realSubtotal);
      priced = {
        subtotal: realSubtotal,
        shipping: fee === 0 ? "Free" : `Rs. ${fee}`,
        total: realSubtotal - result.discount + fee,
      };
      promo = { promo_code: result.promo.code, discount: result.discount };
    }

    const stock = await reserveStock(
      orderItems.map((item: { productId?: string; size?: string; color?: string; variant?: string; quantity?: number }) => ({
        productId: item.productId,
        size: item.size,
        color: item.color || item.variant,
        quantity: item.quantity,
      }))
    );
    if (stock.error) {
      if (stock.applied.length) await restoreStock(stock.applied);
      return NextResponse.json({ error: stock.error }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        email: cleanEmail,
        first_name: firstName.trim(),
        last_name: String(lastName ?? "").trim(),
        address: address.trim(),
        apartment: (apartment || "").trim(),
        city: city.trim(),
        state: (state || "").trim(),
        postal_code: (postalCode || "").trim(),
        phone: phone.trim(),
        user_id: customer?.id ?? null,
        order_items: orderItems,
        subtotal: priced.subtotal,
        shipping: priced.shipping,
        total: priced.total,
        payment_method: paymentMethod || "cod",
        status: "pending",
        ...promo,
      })
      .select("id")
      .single();

    if (error) {
      await restoreStock(stock.applied);
      throw error;
    }

    // Email the customer, and alert the store, once the response has gone out so checkout stays fast.
    const placed = {
      id: data.id,
      email: cleanEmail,
      firstName: firstName.trim(),
      lastName: String(lastName ?? "").trim(),
      address: address.trim(),
      apartment: (apartment || "").trim(),
      city: city.trim(),
      phone: phone.trim(),
      items: orderItems,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      discount: promo?.discount ?? 0,
      promoCode: promo?.promo_code,
      paymentMethod: paymentMethod || "cod",
    };
    // The same Purchase the browser pixel sends, from the server too (deduplicated by the order id).
    const capi = {
      orderId: data.id,
      value: priced.total,
      contents: orderItems.map((item: { productId?: string; quantity?: number; price?: number }) => ({
        id: String(item.productId ?? ""),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        item_price: Number(item.price) || 0,
      })),
      email: placed.email,
      phone: placed.phone,
      firstName: placed.firstName,
      lastName: placed.lastName,
      city: placed.city,
      state: (state || "").trim(),
      postalCode: (postalCode || "").trim(),
      customerId: customer?.id,
      context: capiRequestContext(request),
    };
    after(() => Promise.all([placed.email ? sendOrderConfirmation(placed) : Promise.resolve(false), sendNewOrderAlert(placed), sendCapiPurchase(capi)]));

    return NextResponse.json(
      { message: "Order placed successfully!", orderId: data.id, total: priced.total },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
