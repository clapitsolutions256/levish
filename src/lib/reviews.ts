import { revalidateTag, unstable_cache } from "next/cache";
import { getSupabase, STORAGE_BUCKET } from "@/lib/supabase";
import { reviews as importedReviews, type Review } from "@/data/reviews";

export type ReviewStatus = "pending" | "approved" | "rejected";

/** A review written on this site, as admin sees it. */
export type StoredReview = {
  id: string;
  productSlug: string | null;
  productName: string;
  name: string;
  email: string;
  rating: number;
  text: string;
  photos: string[];
  status: ReviewStatus;
  createdAt: string;
};

type ReviewRow = {
  id: string;
  product_slug: string | null;
  product_name: string;
  name: string;
  email: string;
  rating: number;
  body: string;
  photos: string[] | null;
  status: ReviewStatus;
  created_at: string;
};

const REVIEWS_TAG = "reviews";

function toStored(row: ReviewRow): StoredReview {
  return {
    id: row.id,
    productSlug: row.product_slug,
    productName: row.product_name,
    name: row.name,
    email: row.email,
    rating: row.rating,
    text: row.body,
    photos: row.photos ?? [],
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listStoredReviews(status?: ReviewStatus) {
  let query = getSupabase().from("reviews").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map(toStored);
}

export async function createReview(input: {
  productSlug: string | null;
  productName: string;
  name: string;
  email: string;
  rating: number;
  text: string;
  photos: string[];
}) {
  const { error } = await getSupabase().from("reviews").insert({
    product_slug: input.productSlug,
    product_name: input.productName,
    name: input.name,
    email: input.email,
    rating: input.rating,
    body: input.text,
    photos: input.photos,
  });
  if (error) throw error;
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  const { error } = await getSupabase().from("reviews").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  refreshReviews();
}

/** Deletes a review and the photos the customer uploaded with it. */
export async function deleteReview(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("reviews").delete().eq("id", id).select("photos");
  if (error) throw error;
  const marker = `/object/public/${STORAGE_BUCKET}/`;
  const paths = ((data?.[0] as { photos?: string[] } | undefined)?.photos ?? [])
    .map((url) => url.split(marker)[1])
    .filter((path): path is string => Boolean(path?.startsWith("reviews/")));
  if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  refreshReviews();
}

// Store pages read approved reviews from a server cache; approving or removing one in admin clears it.
const cachedApproved = unstable_cache(
  async (): Promise<Review[]> =>
    (await listStoredReviews("approved")).map((review) => ({
      name: review.name,
      date: review.createdAt.slice(0, 10),
      rating: review.rating,
      text: review.text,
      product: review.productSlug ?? undefined,
      photo: review.photos[0],
      photos: review.photos,
    })),
  ["approved-reviews"],
  { tags: [REVIEWS_TAG], revalidate: 300 }
);

export function refreshReviews() {
  revalidateTag(REVIEWS_TAG, { expire: 0 });
}

/** Every review the store shows: approved ones written on this site first, then those brought over from Shopify. */
export async function getAllReviews(): Promise<Review[]> {
  let approved: Review[] = [];
  try {
    approved = await cachedApproved();
  } catch (err) {
    // The pages still show the imported reviews if the reviews table is missing or unreachable.
    console.error("Reviews error:", err);
  }
  return [...approved, ...importedReviews];
}

export async function getProductReviews(slug: string) {
  return (await getAllReviews()).filter((review) => review.product === slug);
}

export const ratingOf = (review: Review) => review.rating ?? 5;

/** Average stars, to one decimal place. */
export function averageRating(list: Review[]) {
  if (!list.length) return 0;
  return Math.round((list.reduce((sum, review) => sum + ratingOf(review), 0) / list.length) * 10) / 10;
}
