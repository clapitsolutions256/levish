import { NextResponse } from "next/server";
import { getOrder, isUuid } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    console.error("Fetch order error:", err);
    return NextResponse.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const supabase = getSupabase();
    const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ message: "Order deleted." });
  } catch (err) {
    console.error("Delete order error:", err);
    return NextResponse.json({ error: "Failed to delete order." }, { status: 500 });
  }
}
