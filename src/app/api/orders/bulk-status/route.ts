import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { setOrdersStatus, stockNote } from "@/lib/orderStatus";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export async function PATCH(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { orderIds, status } = await request.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No orders selected." }, { status: 400 });
    }
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const ids = orderIds.filter((id: string) => isUuid(id));
    if (ids.length === 0) {
      return NextResponse.json({ error: "No orders selected." }, { status: 400 });
    }
    const result = await setOrdersStatus(ids, status);
    return NextResponse.json({
      message: `${result.count} order(s) updated. ${stockNote(result)}`.trim(),
      modifiedCount: result.count,
    });
  } catch (err) {
    console.error("Bulk status error:", err);
    return NextResponse.json({ error: "Failed to update orders." }, { status: 500 });
  }
}
