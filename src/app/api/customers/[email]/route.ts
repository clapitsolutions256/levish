import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { toOrder, type OrderRow } from "@/lib/orders";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { email: rawEmail } = await params;
    const email = decodeURIComponent(rawEmail).toLowerCase();
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_notes(id, text, created_at)")
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const orders = ((data ?? []) as OrderRow[]).map(toOrder);
    if (orders.length === 0) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

    const latest = orders[0];
    return NextResponse.json({
      email,
      firstName: latest.deliveryAddress.firstName,
      lastName: latest.deliveryAddress.lastName,
      phone: latest.deliveryAddress.phone,
      address: latest.deliveryAddress.address,
      city: latest.deliveryAddress.city,
      state: latest.deliveryAddress.state,
      postalCode: latest.deliveryAddress.postalCode,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      orders,
    });
  } catch (err) {
    console.error("Customer detail error:", err);
    return NextResponse.json({ error: "Failed to fetch customer." }, { status: 500 });
  }
}
