import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { cleanCode, cleanPromo } from "@/lib/promo";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const code = cleanCode(decodeURIComponent((await params).code));
    const body = (await request.json()) as Record<string, unknown>;
    // The code is the key that past orders point to, so it never changes.
    const cleaned = cleanPromo({ ...body, code: undefined }, true);
    if ("error" in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 });

    const { data, error } = await getSupabase().from("promo_codes").update(cleaned.value).eq("code", code).select("code");
    if (error) throw error;
    if (!data?.length) return NextResponse.json({ error: "Promo code not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update promo error:", err);
    return NextResponse.json({ error: "Could not save the promo code." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const code = cleanCode(decodeURIComponent((await params).code));
    const { error } = await getSupabase().from("promo_codes").delete().eq("code", code);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete promo error:", err);
    return NextResponse.json({ error: "Could not delete the promo code." }, { status: 500 });
  }
}
