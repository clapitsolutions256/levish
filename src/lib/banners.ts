import { getSupabase } from "@/lib/supabase";

export type Banner = {
  id: string;
  image: string;
  mobileImage: string;
  alt: string;
  href: string;
  sortOrder: number;
  active: boolean;
};

type BannerRow = {
  id: string;
  image: string;
  mobile_image: string | null;
  alt: string | null;
  href: string | null;
  sort_order: number;
  active: boolean;
};

function toBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    image: row.image,
    mobileImage: row.mobile_image || "",
    alt: row.alt || "Empulse banner",
    href: row.href || "",
    sortOrder: row.sort_order,
    active: row.active,
  };
}

export async function listBanners() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as BannerRow[]).map(toBanner);
}

export async function listActiveBanners() {
  try {
    const banners = await listBanners();
    return banners.filter((banner) => banner.active && banner.image);
  } catch (err) {
    console.error("Banners error:", err);
    return [];
  }
}

export function cleanBanner(body: Record<string, unknown>, partial = false) {
  const image = body.image === undefined ? undefined : String(body.image ?? "").trim();
  const mobileImage = body.mobileImage === undefined ? undefined : String(body.mobileImage ?? "").trim();
  const alt = body.alt === undefined ? undefined : String(body.alt ?? "").trim();
  const href = body.href === undefined ? undefined : String(body.href ?? "").trim();
  const sortOrder = body.sortOrder === undefined ? undefined : Number(body.sortOrder);

  if (!partial && !image) return { error: "Upload a banner image." as const };
  if (image !== undefined && !image) return { error: "Upload a banner image." as const };
  if (image && image.length > 500) return { error: "Image address is too long." as const };
  if (mobileImage && mobileImage.length > 500) return { error: "Mobile image address is too long." as const };
  if (alt && alt.length > 140) return { error: "Alt text must be under 140 characters." as const };
  if (href && href.length > 300) return { error: "Link must be under 300 characters." as const };
  if (href && !href.startsWith("/") && !href.startsWith("https://") && !href.startsWith("http://")) {
    return { error: "Link must start with / or https://." as const };
  }
  if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999)) {
    return { error: "Order must be a number from 0 to 999." as const };
  }

  const value: Record<string, unknown> = {};
  if (image !== undefined) value.image = image;
  if (mobileImage !== undefined) value.mobile_image = mobileImage || null;
  if (alt !== undefined) value.alt = alt;
  if (href !== undefined) value.href = href;
  if (sortOrder !== undefined) value.sort_order = sortOrder;
  if (body.active !== undefined) value.active = Boolean(body.active);
  return { value };
}
