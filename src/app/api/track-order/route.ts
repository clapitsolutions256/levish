import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { withProductImages, type OrderItem } from "@/lib/orders";

// Guest order tracking by phone number. Guests check out without an email, so the phone they gave is
// how they find their orders again. Only what tells them where an order is goes back: order number,
// date, status, total, payment, city and the pieces. Never the name, address or phone.

/** The 10 digits after the country code (3XXXXXXXXX) for 03XX…, +92 3XX… or 92 3XX… */
function phoneKey(value: unknown) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(4);
  else if (digits.startsWith("92") && digits.length >= 12) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? digits : "";
}

// Slows anyone trying number after number. Per server process, which is enough to blunt it.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_LOOKUPS = 12;
const lookups = new Map<string, number[]>();

function tooMany(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (lookups.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  lookups.set(ip, recent);
  if (lookups.size > 5000) lookups.clear();
  return recent.length > MAX_LOOKUPS;
}

type Row = {
  id: string;
  phone: string;
  city: string;
  order_items: OrderItem[] | null;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
};

export async function POST(request: Request) {
  if (tooMany(request)) {
    return NextResponse.json({ error: "Too many searches. Please wait a few minutes and try again." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const key = phoneKey(body?.phone);
  if (!key) {
    return NextResponse.json({ error: "Enter the phone number you used for the order, e.g. 0300 1234567." }, { status: 400 });
  }

  try {
    // Narrow with the last 7 digits (the same in every stored format), then match the full number.
    const { data, error } = await getSupabase()
      .from("orders")
      .select("id, phone, city, order_items, total, status, payment_method, created_at")
      .ilike("phone", `%${key.slice(-7)}%`)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;

    const rows = ((data ?? []) as Row[]).filter((row) => phoneKey(row.phone) === key).slice(0, 30);
    const orders = await Promise.all(
      rows.map(async (row) => ({
        number: row.id.slice(-6).toUpperCase(),
        placedAt: row.created_at,
        status: row.status,
        total: Number(row.total),
        paymentMethod: row.payment_method,
        city: row.city,
        items: (await withProductImages(row.order_items ?? [])).map((item) => ({
          name: item.name,
          size: item.size ?? "",
          color: item.variant ?? "",
          quantity: item.quantity,
          price: item.price,
          image: item.image ?? "",
        })),
      }))
    );
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Track order error:", err);
    return NextResponse.json({ error: "Could not look up your orders. Please try again." }, { status: 500 });
  }
}
