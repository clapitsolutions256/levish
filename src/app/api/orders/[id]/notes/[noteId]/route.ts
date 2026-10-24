import { NextResponse } from "next/server";
import { isUuid } from "@/lib/orders";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id, noteId } = await params;
    if (!isUuid(id) || !isUuid(noteId)) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("order_notes")
      .delete()
      .eq("id", noteId)
      .eq("order_id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ message: "Note deleted." });
  } catch (err) {
    console.error("Delete note error:", err);
    return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
  }
}
