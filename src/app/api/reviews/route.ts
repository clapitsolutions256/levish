import { after, NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";
import { compressImage, IMAGE_CACHE_SECONDS } from "@/lib/compressImage";
import { sendNewReviewAlert } from "@/lib/email";
import { createReview } from "@/lib/reviews";
import { getSupabase, STORAGE_BUCKET } from "@/lib/supabase";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A few reviews an hour from one address is plenty for a real customer; more is a bot.
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((time) => now - time < 3600_000);
  times.push(now);
  recent.set(ip, times);
  return times.length > 5;
}

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

/** A customer's review. It is saved as pending and only shows on the site once admin approves it. */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    // The hidden "company" field is empty for people; bots fill it in. Pretend it worked.
    if (text(form.get("company"))) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (tooMany(ip)) return NextResponse.json({ error: "Too many reviews from this connection. Please try again later." }, { status: 429 });

    const name = text(form.get("name")).slice(0, 60);
    const email = text(form.get("email")).slice(0, 120);
    const body = text(form.get("text")).slice(0, 1500);
    const rating = Number(form.get("rating"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Please choose a star rating." }, { status: 400 });
    if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    if (body.length < 5) return NextResponse.json({ error: "Please write a few words about your order." }, { status: 400 });
    if (email && !EMAIL.test(email)) return NextResponse.json({ error: "Please check your email address." }, { status: 400 });

    const slug = text(form.get("product"));
    const product = slug ? (await getActiveProducts()).find((item) => item.slug === slug) : undefined;
    if (slug && !product) return NextResponse.json({ error: "That product is no longer in the shop." }, { status: 400 });

    const files = form.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0).slice(0, MAX_PHOTOS);
    for (const file of files) {
      if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Photos must be images." }, { status: 400 });
      if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: "Each photo must be under 10 MB." }, { status: 400 });
    }

    const supabase = getSupabase();
    const photos: string[] = [];
    for (const file of files) {
      const path = `reviews/${crypto.randomUUID()}.webp`;
      const image = await compressImage(Buffer.from(await file.arrayBuffer()), 1200);
      const uploaded = await supabase.storage.from(STORAGE_BUCKET).upload(path, image, {
        contentType: "image/webp",
        cacheControl: IMAGE_CACHE_SECONDS,
        upsert: false,
      });
      if (uploaded.error) throw uploaded.error;
      photos.push(supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl);
    }

    await createReview({ productSlug: product?.slug ?? null, productName: product?.name ?? "", name, email, rating, text: body, photos });
    after(() => sendNewReviewAlert({ name, email, rating, text: body, productName: product?.name ?? "", photos: photos.length }));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Could not send your review. Please try again." }, { status: 500 });
  }
}
