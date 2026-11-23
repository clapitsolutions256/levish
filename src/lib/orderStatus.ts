import { getSupabase } from "@/lib/supabase";
import { refreshCatalog } from "@/lib/catalog";
import { articleKey } from "@/lib/showcase";
import { findVariant, normalizeVariants } from "@/lib/variants";
import type { Product } from "@/types";

// Changing an order to or from "cancelled" moves its pieces back into stock, or takes them out again.
// Only a real change counts: cancelling an order that is already cancelled does not restock twice.

type Line = { productId?: string; size?: string; color?: string; variant?: string; quantity?: number };
type ProductRow = { id: string; name: string; color: string; brand: string | null; subcategory: string; category_id: string; variants: unknown; active: boolean };

const PRODUCT_FIELDS = "id, name, color, brand, subcategory, category_id, variants, active";

function asProduct(row: ProductRow) {
  return { name: row.name, color: row.color, brand: row.brand ?? undefined, subcategory: row.subcategory, categoryId: row.category_id, variants: normalizeVariants(row.variants) } as Product;
}

// A one-colour product that was merged into a product with colour options is hidden, and its stock
// now lives on the merged product. Find that product: same article, and it has this size and colour.
async function mergedInto(row: ProductRow, size: string, color: string) {
  const { data, error } = await getSupabase()
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("active", true)
    .eq("category_id", row.category_id)
    .eq("subcategory", row.subcategory);
  if (error) throw error;
  const key = articleKey(asProduct(row));
  const candidates = ((data ?? []) as ProductRow[]).filter(
    (item) => (item.brand ?? "") === (row.brand ?? "") && findVariant(normalizeVariants(item.variants), size, color)
  );
  // Same article by name; or, when the merged product was renamed, the only one of this brand and type with that size and colour.
  return candidates.find((item) => articleKey(asProduct(item)) === key) ?? (candidates.length === 1 ? candidates[0] : undefined);
}

/** Adds (direction 1) or removes (direction -1) an order's pieces from stock. Returns what moved and what couldn't. */
async function moveStock(lines: Line[], direction: 1 | -1) {
  const supabase = getSupabase();
  let moved = 0;
  const missed: string[] = [];
  for (const line of lines) {
    const productId = String(line.productId ?? "").trim();
    const quantity = Math.max(0, Math.floor(Number(line.quantity) || 0));
    const size = String(line.size ?? "").trim();
    const color = String(line.color || line.variant || "").trim();
    if (!productId || quantity < 1) continue;

    const { data, error } = await supabase.from("products").select(PRODUCT_FIELDS).eq("id", productId).maybeSingle();
    if (error) throw error;
    let product = data as ProductRow | null;
    if (product && !product.active) product = (await mergedInto(product, size, color)) ?? product;
    const variants = product ? normalizeVariants(product.variants) : [];
    const match = findVariant(variants, size, color);
    if (!product || !match) {
      missed.push([product?.name ?? productId, color, size && `size ${size}`].filter(Boolean).join(", "));
      continue;
    }
    match.stock = Math.max(0, match.stock + direction * quantity);
    const { error: updateError } = await supabase.from("products").update({ variants }).eq("id", product.id);
    if (updateError) throw updateError;
    moved += quantity;
  }
  return { moved, missed };
}

/** Sets the status of these orders and keeps stock in step with cancelling or un-cancelling them. */
export async function setOrdersStatus(ids: string[], status: string) {
  const supabase = getSupabase();
  const updated_at = new Date().toISOString();
  // Orders that are really crossing the cancelled line. The status filter makes the update the guard,
  // so two clicks at once can't restock the same order twice.
  const crossing = supabase.from("orders").update({ status, updated_at }).in("id", ids);
  const { data: crossed, error } = await (status === "cancelled" ? crossing.neq("status", "cancelled") : crossing.eq("status", "cancelled")).select(
    "id, order_items"
  );
  if (error) throw error;

  const done = new Set((crossed ?? []).map((row) => row.id as string));
  const rest = ids.filter((id) => !done.has(id));
  let count = done.size;
  if (rest.length) {
    const { data, error: restError } = await supabase.from("orders").update({ status, updated_at }).in("id", rest).select("id");
    if (restError) throw restError;
    count += data?.length ?? 0;
  }

  const direction = status === "cancelled" ? 1 : -1;
  let moved = 0;
  const missed: string[] = [];
  for (const row of crossed ?? []) {
    try {
      const result = await moveStock((row.order_items ?? []) as Line[], direction);
      moved += result.moved;
      missed.push(...result.missed);
    } catch (err) {
      console.error("Stock update after status change failed:", row.id, err);
      missed.push(`order ${String(row.id).slice(-6).toUpperCase()}`);
    }
  }
  if (moved) refreshCatalog();
  return { count, restocked: direction === 1 ? moved : 0, unstocked: direction === -1 ? moved : 0, missed };
}

/** One line for the admin: what happened to stock. */
export function stockNote(result: { restocked: number; unstocked: number; missed: string[] }) {
  const parts: string[] = [];
  if (result.restocked) parts.push(`${result.restocked} piece${result.restocked === 1 ? "" : "s"} back in stock.`);
  if (result.unstocked) parts.push(`${result.unstocked} piece${result.unstocked === 1 ? "" : "s"} taken from stock again.`);
  if (result.missed.length) parts.push(`Stock not changed for: ${result.missed.join("; ")}.`);
  return parts.join(" ");
}
