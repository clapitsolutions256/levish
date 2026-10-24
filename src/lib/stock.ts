import { getSupabase } from "@/lib/supabase";
import { refreshCatalog } from "@/lib/catalog";
import { findVariant, normalizeVariants, type ProductVariant } from "@/lib/variants";

type StockLine = {
  productId?: string;
  size?: string;
  color?: string;
  quantity?: number;
};

type Snapshot = { id: string; previous: ProductVariant[] };

export async function reserveStock(lines: StockLine[]) {
  const supabase = getSupabase();
  const applied: Snapshot[] = [];

  for (const line of lines) {
    const productId = String(line.productId ?? "").trim();
    const qty = Math.max(0, Math.floor(Number(line.quantity) || 0));
    if (!productId || qty < 1) continue;

    const { data, error } = await supabase.from("products").select("id, name, variants").eq("id", productId).maybeSingle();
    if (error) throw error;
    if (!data) {
      return { error: "A product in this order is no longer available.", applied };
    }

    const previous = normalizeVariants(data.variants);
    if (!previous.length) continue;

    const variants = previous.map((variant) => ({ ...variant }));
    const size = String(line.size ?? "").trim();
    const color = String(line.color ?? "").trim();
    const match = findVariant(variants, size, color);
    const label = [data.name, color, size ? `size ${size}` : ""].filter(Boolean).join(", ");
    if (!match) {
      return { error: `Choose a size and color for ${data.name}.`, applied };
    }
    if (match.stock < qty) {
      return {
        error: match.stock < 1 ? `${label} is out of stock.` : `Only ${match.stock} left for ${label}.`,
        applied,
      };
    }

    match.stock -= qty;
    const { error: updateError } = await supabase.from("products").update({ variants }).eq("id", productId);
    if (updateError) throw updateError;
    applied.push({ id: productId, previous });
  }

  if (applied.length) refreshCatalog();
  return { applied };
}

export async function restoreStock(applied: Snapshot[]) {
  const supabase = getSupabase();
  for (const row of [...applied].reverse()) {
    await supabase.from("products").update({ variants: row.previous }).eq("id", row.id);
  }
  if (applied.length) refreshCatalog();
}

export function stockLimit(variants: ProductVariant[] | undefined, size: string, color: string) {
  if (!variants?.length) return null;
  return findVariant(variants, size, color)?.stock ?? 0;
}
