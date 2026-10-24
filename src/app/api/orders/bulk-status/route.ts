import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";
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
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", ids)
      .select("id");
    if (error) throw error;
    return NextResponse.json({
      message: `${data?.length ?? 0} order(s) updated.`,
      modifiedCount: data?.length ?? 0,
    });
  } catch (err) {
    console.error("Bulk status error:", err);
    return NextResponse.json({ error: "Failed to update orders." }, { status: 500 });
  }
}
