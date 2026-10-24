import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const orders = await listOrders({
      status: searchParams.get("status"),
      search: searchParams.get("search"),
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
