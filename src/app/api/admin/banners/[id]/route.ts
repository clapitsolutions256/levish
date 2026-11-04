import { NextResponse, after } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { cleanBanner } from "@/lib/banners";
import { getSupabase } from "@/lib/supabase";
import { bannerPhotoUrls, removeUnusedPhotos } from "@/lib/productImages";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const cleaned = cleanBanner(body, true);
    if ("error" in cleaned) return NextResponse.json({ error: cleaned.error }, { status: 400 });
    if (!Object.keys(cleaned.value).length) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: previous } = await supabase.from("banners").select("image, mobile_image").eq("id", id).maybeSingle();
    const { data: saved, error } = await supabase.from("banners").update(cleaned.value).eq("id", id).select("image, mobile_image").maybeSingle();
    if (error) throw error;
    // A replaced banner image is removed once nothing else shows it.
    after(() => removeUnusedPhotos(bannerPhotoUrls(previous), bannerPhotoUrls(saved)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update banner error:", err);
    return NextResponse.json({ error: "Could not update the banner." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const supabase = getSupabase();
    const { data, error } = await supabase.from("banners").delete().eq("id", id).select("image, mobile_image");
    if (error) throw error;
    after(() => removeUnusedPhotos(bannerPhotoUrls(data?.[0])));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete banner error:", err);
    return NextResponse.json({ error: "Could not delete the banner." }, { status: 500 });
  }
}
