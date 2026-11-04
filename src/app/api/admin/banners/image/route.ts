import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { getSupabase, STORAGE_BUCKET } from "@/lib/supabase";
import { compressImage, IMAGE_CACHE_SECONDS } from "@/lib/compressImage";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image." }, { status: 400 });
    }
    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP images." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
    }

    const supabase = getSupabase();
    const path = `banners/${crypto.randomUUID()}.webp`;
    const image = await compressImage(Buffer.from(await file.arrayBuffer()), 2000);
    const uploaded = await supabase.storage.from(STORAGE_BUCKET).upload(path, image, {
      contentType: "image/webp",
      cacheControl: IMAGE_CACHE_SECONDS,
      upsert: false,
    });
    if (uploaded.error) throw uploaded.error;
    const url = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Banner image error:", err);
    return NextResponse.json({ error: "Could not upload the banner." }, { status: 500 });
  }
}
