import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { cleanBanner, listBanners } from "@/lib/banners";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    return NextResponse.json(await listBanners());
  } catch (err) {
    console.error("Admin banners error:", err);
    return NextResponse.json({ error: "Could not load banners." }, { status: 500 });
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
    const cleaned = cleanBanner(body);
    if ("error" in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 });

    const supabase = getSupabase();
    if (cleaned.value.sort_order === undefined) {
      const existing = await listBanners();
      const max = existing.reduce((highest, banner) => Math.max(highest, banner.sortOrder), -1);
      cleaned.value.sort_order = max + 1;
    }
    if (cleaned.value.active === undefined) cleaned.value.active = true;
    if (cleaned.value.alt === undefined || cleaned.value.alt === "") cleaned.value.alt = "Empulse banner";

    const { data, error } = await supabase.from("banners").insert(cleaned.value).select("id").single();
    if (error) throw error;
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error("Create banner error:", err);
    return NextResponse.json({ error: "Could not save the banner." }, { status: 500 });
  }
}
