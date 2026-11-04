import { NextResponse } from "next/server";
import { checkPromo, serverSubtotal } from "@/lib/promo";

// Checks a promo code against the cart. The order itself is checked again at checkout.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const lines = Array.isArray(body.orderItems) ? body.orderItems : [];
    const subtotal = await serverSubtotal(lines);
    if (subtotal === null) {
      return NextResponse.json({ error: "Your cart has changed. Please refresh the page." }, { status: 400 });
    }

    const result = await checkPromo({
      code: body.code,
      subtotal,
      email: String(body.email ?? ""),
      phone: String(body.phone ?? ""),
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const { promo, discount } = result;
    return NextResponse.json({ code: promo.code, type: promo.type, value: promo.value, discount });
  } catch (err) {
    console.error("Promo check error:", err);
    return NextResponse.json({ error: "Could not check the promo code. Please try again." }, { status: 500 });
  }
}
