import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("orders").select("status, total");
    if (error) throw error;
    const rows = data ?? [];
    const statusCounts: Record<string, number> = {};
    let revenue = 0;
    for (const row of rows) {
      statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
      if (row.status !== "cancelled") revenue += Number(row.total) || 0;
    }
    return NextResponse.json({ totalOrders: rows.length, revenue, statusCounts });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}
