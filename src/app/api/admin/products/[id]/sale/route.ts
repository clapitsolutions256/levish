import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { refreshCatalog } from "@/lib/catalog";
import { MAX_SALE_PERCENT } from "@/lib/sale";

type Params = { params: Promise<{ id: string }> };

// Send { percent: 0 } to remove the sale.
export async function POST(request: Request, { params }: Params) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const percent = Number(body.percent);
    if (!Number.isInteger(percent) || percent < 0 || percent > MAX_SALE_PERCENT) {
      return NextResponse.json({ error: `Enter a whole number from 1 to ${MAX_SALE_PERCENT}.` }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("products")
      .update({ sale_percent: percent, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Product sale error:", err);
    return NextResponse.json({ error: "Could not update the sale." }, { status: 500 });
  }
}
