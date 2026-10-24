import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { refreshCatalog } from "@/lib/catalog";
import { normalizeVariants } from "@/lib/variants";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const supabase = getSupabase();
    const { data, error } = await supabase.from("products").select("variants").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const variants = normalizeVariants(data.variants);
    if (!variants.length) {
      return NextResponse.json({ error: "Add sizes to this product before marking it sold." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        variants: variants.map((variant) => ({ ...variant, stock: 0 })),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (updateError) throw updateError;
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Mark sold error:", err);
    return NextResponse.json({ error: "Could not mark the product as sold." }, { status: 500 });
  }
}
