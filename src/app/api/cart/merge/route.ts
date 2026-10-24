import { NextResponse } from "next/server";
import { cartResponse, mergeGuestCart } from "@/lib/cart";
import { getCustomer, unauthorized } from "@/lib/customerAuth";

export async function POST(request: Request) {
  try {
    const customer = await getCustomer(request);
    if (!customer) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const guestToken = String(body?.guestToken ?? request.headers.get("x-cart-token") ?? "").trim();
    const items = await mergeGuestCart(customer.id, guestToken);
    return cartResponse(items);
  } catch {
    return NextResponse.json({ error: "Could not save your cart." }, { status: 500 });
  }
}
