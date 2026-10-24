import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function POST(
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
    const { note } = await request.json();
    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Note cannot be empty." }, { status: 400 });
    }
    if (!isUuid(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const supabase = getSupabase();
    const existing = await supabase.from("orders").select("id").eq("id", id).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const { data, error } = await supabase
      .from("order_notes")
      .insert({ order_id: id, text: note.trim() })
      .select("id, text, created_at")
      .single();
    if (error) throw error;

    await supabase.from("orders").update({ updated_at: new Date().toISOString() }).eq("id", id);

    return NextResponse.json(
      { message: "Note added.", note: { _id: data.id, text: data.text, createdAt: data.created_at } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Add note error:", err);
    return NextResponse.json({ error: "Failed to add note." }, { status: 500 });
  }
}
