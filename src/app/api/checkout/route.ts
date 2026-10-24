import { NextResponse } from "next/server";
import { getCustomer } from "@/lib/customerAuth";
import { reserveStock, restoreStock } from "@/lib/stock";
import { getSupabase } from "@/lib/supabase";
import { PAUSED_NOTICE, PRODUCTS_PAUSED } from "@/lib/storeStatus";

export async function POST(request: Request) {
  if (PRODUCTS_PAUSED) {
    return NextResponse.json({ error: `${PAUSED_NOTICE.title}. ${PAUSED_NOTICE.text}` }, { status: 507 });
  }
  try {
    const customer = await getCustomer(request);
    const {
      email, firstName, lastName, address, apartment,
      city, state, postalCode, phone, orderItems,
      subtotal, shipping, total, paymentMethod,
    } = await request.json();

    if (!email || !firstName || !lastName || !address || !city || !phone) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
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
        email: email.toLowerCase().trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address: address.trim(),
        apartment: (apartment || "").trim(),
        city: city.trim(),
        state: (state || "").trim(),
        postal_code: (postalCode || "").trim(),
        phone: phone.trim(),
        user_id: customer?.id ?? null,
        order_items: orderItems,
        subtotal: Number(subtotal),
        shipping: shipping || "Free",
        total: Number(total),
        payment_method: paymentMethod || "cod",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      await restoreStock(stock.applied);
      throw error;
    }

    return NextResponse.json(
      { message: "Order placed successfully!", orderId: data.id },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
