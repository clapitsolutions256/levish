import { NextResponse } from "next/server";
import { getOrder, isUuid } from "@/lib/orders";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const { notes, ...publicOrder } = order;
    void notes;
    return NextResponse.json(publicOrder);
  } catch (err) {
    console.error("Fetch order (public) error:", err);
    return NextResponse.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}
