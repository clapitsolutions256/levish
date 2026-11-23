import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { setOrdersStatus, stockNote } from "@/lib/orderStatus";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function PATCH(
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
    const { status } = await request.json();
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    if (!isUuid(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const result = await setOrdersStatus([id], status);
    if (!result.count) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ message: `Status updated. ${stockNote(result)}`.trim(), status });
  } catch (err) {
    console.error("Update status error:", err);
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
}
