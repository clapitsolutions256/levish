import { NextResponse, after } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { isCategoryId } from "@/data/productCategories";
import { refreshCatalog, resolveProductPhotos, saveBrand } from "@/lib/catalog";
import { getSupabase } from "@/lib/supabase";
import { productPhotoUrls, removeUnusedPhotos } from "@/lib/productImages";
import { colorLabel, normalizeColorImages, normalizeVariants } from "@/lib/variants";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const price = Number(body.price);
    const compareRaw = body.compareAtPrice;
    const compareAtPrice = compareRaw === "" || compareRaw == null ? null : Number(compareRaw);
    const categoryId = String(body.categoryId ?? "");
    const colorImages = normalizeColorImages(body.colorImages);
    const photos = resolveProductPhotos(body, colorImages);

    if (!name || name.length > 120) {
      return NextResponse.json({ error: "Enter a product name." }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Enter a valid price." }, { status: 400 });
    }
    if (compareAtPrice != null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
      return NextResponse.json({ error: "Compare-at price must be higher than the selling price." }, { status: 400 });
    }
    if (!isCategoryId(categoryId)) {
      return NextResponse.json({ error: "Choose a category." }, { status: 400 });
    }
    if ("error" in photos) {
      return NextResponse.json({ error: photos.error }, { status: 400 });
    }
    const variants = normalizeVariants(body.variants);
    const color = colorLabel(variants, String(body.color ?? ""));

    const supabase = getSupabase();
    const { data: previous, error: previousError } = await supabase
      .from("products")
      .select("image, images, color_images")
      .eq("id", id)
      .maybeSingle();
    if (previousError) throw previousError;
    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        compare_at_price: compareAtPrice,
        category_id: categoryId,
        subcategory: String(body.subcategory ?? "").trim(),
        brand: String(body.brand ?? "").trim().slice(0, 60),
        color,
        variants,
        color_images: colorImages,
        image: photos.image,
        images: photos.images,
        description: String(body.description ?? "").trim(),
        featured: Boolean(body.featured),
        is_new: Boolean(body.new),
        active: Boolean(body.active),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    const before = productPhotoUrls(previous);
    const kept = productPhotoUrls({ image: photos.image, images: photos.images, color_images: colorImages });
    after(() => removeUnusedPhotos(before, kept));
    refreshCatalog();
    await saveBrand(String(body.brand ?? "")).catch((err) => console.error("Save brand error:", err));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Could not update the product." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const supabase = getSupabase();
    const { data: previous, error: previousError } = await supabase
      .from("products")
      .select("image, images, color_images")
      .eq("id", id)
      .maybeSingle();
    if (previousError) throw previousError;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    const before = productPhotoUrls(previous);
    after(() => removeUnusedPhotos(before));
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Could not delete the product." }, { status: 500 });
  }
}
