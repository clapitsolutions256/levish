import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

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
    const files = form.getAll("file").filter((item): item is File => item instanceof File);
    if (!files.length) {
      return NextResponse.json({ error: "Choose an image." }, { status: 400 });
    }
    if (files.length > 8) {
      return NextResponse.json({ error: "Upload up to 8 images at a time." }, { status: 400 });
    }

    const supabase = getSupabase();
    const urls: string[] = [];
    for (const file of files) {
      const ext = TYPES[file.type];
      if (!ext) {
        return NextResponse.json({ error: "Use JPG, PNG, or WebP images." }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Each image must be under 5 MB." }, { status: 400 });
      }
      const path = `${crypto.randomUUID()}.${ext}`;
      const uploaded = await supabase.storage
        .from("product-images")
        .upload(path, Buffer.from(await file.arrayBuffer()), {
          contentType: file.type,
          upsert: false,
        });
      if (uploaded.error) throw uploaded.error;
      urls.push(supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl);
    }

    return NextResponse.json({ url: urls[0], urls });
  } catch (err) {
    console.error("Product image error:", err);
    return NextResponse.json({ error: "Could not upload the image." }, { status: 500 });
  }
}
