import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { isCategoryId } from "@/data/productCategories";
import { listProducts, refreshCatalog, slugify, resolveProductPhotos, saveBrand } from "@/lib/catalog";
import { getSupabase } from "@/lib/supabase";
import { colorLabel, normalizeColorImages, normalizeVariants } from "@/lib/variants";

function cleanProduct(body: Record<string, unknown>, existingSlug?: string) {
  const name = String(body.name ?? "").trim();
  const price = Number(body.price);
  const compareRaw = body.compareAtPrice;
  const compareAtPrice = compareRaw === "" || compareRaw == null ? null : Number(compareRaw);
  const categoryId = String(body.categoryId ?? "");
  const subcategory = String(body.subcategory ?? "").trim();
  const brand = String(body.brand ?? "").trim().slice(0, 60);
  const color = String(body.color ?? "").trim();
  const description = String(body.description ?? "").trim();
  const colorImages = normalizeColorImages(body.colorImages);
  const photos = resolveProductPhotos(body, colorImages);

  if (!name || name.length > 120) return { error: "Enter a product name." as const };
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price." as const };
  if (compareAtPrice != null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price)) {
    return { error: "Compare-at price must be higher than the selling price." as const };
  }
  if (!isCategoryId(categoryId)) return { error: "Choose a category." as const };
  if ("error" in photos) return { error: photos.error };
  const variants = normalizeVariants(body.variants);

  return {
    value: {
      name,
      slug: existingSlug || slugify(name),
      price,
      compare_at_price: compareAtPrice,
      category_id: categoryId,
      subcategory,
      brand,
      color: colorLabel(variants, color),
      variants,
      color_images: colorImages,
      image: photos.image,
      images: photos.images,
      description,
      featured: Boolean(body.featured),
      is_new: Boolean(body.new),
      active: body.active === undefined ? true : Boolean(body.active),
    },
  };
}

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = (searchParams.get("search") ?? "").trim().toLowerCase();
    let products = await listProducts();
    if (category && category !== "all") {
      products = products.filter((product) => product.categoryId === category);
    }
    if (search) {
      products = products.filter((product) =>
        [product.name, product.brand, product.color, product.subcategory, product.slug].join(" ").toLowerCase().includes(search)
      );
    }
    return NextResponse.json(products);
  } catch (err) {
    console.error("Admin products error:", err);
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const parsed = cleanProduct(await request.json());
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const value = parsed.value;
    const supabase = getSupabase();

    let slug = value.slug || `product-${Date.now()}`;
    const taken = await supabase.from("products").select("id").eq("slug", slug).maybeSingle();
    if (taken.data) slug = `${slug}-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabase
      .from("products")
      .insert({ ...value, id: crypto.randomUUID(), slug })
      .select("id")
      .single();
    if (error) throw error;
    await saveBrand(value.brand).catch((err) => console.error("Save brand error:", err));
    refreshCatalog();
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Could not create the product." }, { status: 500 });
  }
}
