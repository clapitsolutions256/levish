import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";
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
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ message: "Status updated.", status });
  } catch (err) {
    console.error("Update status error:", err);
    return NextResponse.json({ error: "Failed to update status." }, { status: 500 });
  }
}
