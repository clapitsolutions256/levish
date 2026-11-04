import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

// The newest few orders, kept small so the admin panel can poll it for new-order alerts.
export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("id, first_name, last_name, city, total, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return NextResponse.json(
      (data ?? []).map((row) => ({
        _id: row.id,
        name: [row.first_name, row.last_name].filter(Boolean).join(" "),
        city: row.city ?? "",
        total: Number(row.total) || 0,
        createdAt: row.created_at,
      }))
    );
  } catch (err) {
    console.error("Latest orders error:", err);
    return NextResponse.json({ error: "Failed to fetch latest orders." }, { status: 500 });
  }
}
