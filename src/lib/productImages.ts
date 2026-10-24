import { getSupabase } from "@/lib/supabase";

const BUCKET = "product-images";

type PhotoRow = {
  image?: string | null;
  images?: unknown;
  color_images?: unknown;
};

export function productPhotoUrls(row: PhotoRow | null | undefined) {
  if (!row) return [];
  const urls = new Set<string>();
  if (row.image) urls.add(String(row.image));
  if (Array.isArray(row.images)) row.images.forEach((url) => url && urls.add(String(url)));
  if (Array.isArray(row.color_images)) {
    for (const gallery of row.color_images) {
      const images = (gallery as { images?: unknown })?.images;
      if (Array.isArray(images)) images.forEach((url) => url && urls.add(String(url)));
    }
  }
  return [...urls];
}

// Only files in our own bucket are deleted. Local /kairo paths and other hosts are left alone.
function storagePath(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return "";
  return decodeURIComponent(url.slice(at + marker.length).split("?")[0]);
}

// Deletes photos that left a product, unless another product, a banner or an order still shows them.
// Call it after the product row is updated or deleted. Failures are logged, not thrown.
export async function removeUnusedPhotos(before: string[], after: string[] = []) {
  try {
    const kept = new Set(after);
    const paths = [...new Set(before.filter((url) => !kept.has(url)).map(storagePath).filter(Boolean))];
    if (!paths.length) return;

    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("product_images_in_use", { paths });
    if (error) throw error;
    const inUse = new Set(((data ?? []) as unknown[]).map(String));
    const unused = paths.filter((path) => !inUse.has(path));
    if (!unused.length) return;

    const { error: removeError } = await supabase.storage.from(BUCKET).remove(unused);
    if (removeError) throw removeError;
  } catch (err) {
    console.error("Photo cleanup error:", err);
  }
}
