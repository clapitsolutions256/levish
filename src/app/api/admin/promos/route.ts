import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { cleanPromo, listPromos, missingTable } from "@/lib/promo";
import { getSupabase } from "@/lib/supabase";

const SETUP_ERROR = "Promo codes are not set up yet. Run supabase/promo-codes.sql in the Supabase SQL editor.";

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    return NextResponse.json(await listPromos());
  } catch (err) {
    console.error("Admin promos error:", err);
    const error = missingTable(err) ? SETUP_ERROR : "Could not load promo codes.";
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const cleaned = cleanPromo(body);
    if ("error" in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 });

    const { error } = await getSupabase().from("promo_codes").insert(cleaned.value);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "This code already exists." }, { status: 400 });
    }
    if (error) throw error;
    return NextResponse.json({ code: cleaned.value.code }, { status: 201 });
  } catch (err) {
    console.error("Create promo error:", err);
    const error = missingTable(err) ? SETUP_ERROR : "Could not save the promo code.";
    return NextResponse.json({ error }, { status: 500 });
  }
}
