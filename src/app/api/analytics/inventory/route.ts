import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { listProducts } from "@/lib/catalog";
import { totalStock } from "@/lib/variants";
import type { Product } from "@/types";

// A size/color with this many units or fewer counts as low stock.
const LOW_STOCK = 2;
const RECENT_DAYS = 30;

type Item = { productId?: string; name: string; price: number; quantity: number };

function typeOf(product: Product | undefined) {
  if (!product) return "Other";
  if (product.categoryId === "shoes") return "Shoes";
  return product.subcategory?.trim() || "Other";
}

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const [products, ordersResult] = await Promise.all([
      listProducts(),
      getSupabase().from("orders").select("created_at, status, order_items"),
    ]);
    if (ordersResult.error) throw ordersResult.error;

    const byId = new Map(products.map((product) => [product.id, product]));
    const byName = new Map(products.map((product) => [product.name.trim().toLowerCase(), product]));
    const find = (item: Item) => (item.productId && byId.get(item.productId)) || byName.get(item.name?.trim().toLowerCase());

    // Stock on hand
    const tracked = products.filter((product) => product.variants?.length);
    const unitsInStock = tracked.reduce((sum, product) => sum + totalStock(product.variants), 0);
    const stockValue = tracked.reduce((sum, product) => sum + totalStock(product.variants) * product.price, 0);
    const outOfStock = tracked
      .filter((product) => totalStock(product.variants) < 1)
      .map((product) => ({ id: product.id, name: product.name, image: product.image, active: product.active !== false }));
    const lowStock = tracked
      .flatMap((product) =>
        (product.variants ?? [])
          .filter((variant) => variant.stock > 0 && variant.stock <= LOW_STOCK)
          .map((variant) => ({
            id: product.id,
            name: product.name,
            image: product.image,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
          }))
      )
      .sort((a, b) => a.stock - b.stock);

    // Sales
    const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
    const sold = new Map<string, { qty: number; revenue: number; recentQty: number; recentRevenue: number; name: string; product?: Product }>();
    const byType = new Map<string, { sold: number; revenue: number; inStock: number }>();
    let unitsSold = 0;
    let unitsSoldRecent = 0;

    for (const order of ordersResult.data ?? []) {
      if (order.status === "cancelled") continue;
      const recent = new Date(order.created_at).getTime() >= since;
      for (const item of (order.order_items ?? []) as Item[]) {
        const qty = Number(item.quantity) || 0;
        const revenue = (Number(item.price) || 0) * qty;
        const product = find(item);
        const key = product?.id ?? item.name;
        const entry = sold.get(key) ?? { qty: 0, revenue: 0, recentQty: 0, recentRevenue: 0, name: product?.name ?? item.name, product };
        entry.qty += qty;
        entry.revenue += revenue;
        if (recent) {
          entry.recentQty += qty;
          entry.recentRevenue += revenue;
        }
        sold.set(key, entry);
        unitsSold += qty;
        if (recent) unitsSoldRecent += qty;
        const type = byType.get(typeOf(product)) ?? { sold: 0, revenue: 0, inStock: 0 };
        type.sold += qty;
        type.revenue += revenue;
        byType.set(typeOf(product), type);
      }
    }
    for (const product of tracked) {
      const type = byType.get(typeOf(product)) ?? { sold: 0, revenue: 0, inStock: 0 };
      type.inStock += totalStock(product.variants);
      byType.set(typeOf(product), type);
    }

    const row = (entry: NonNullable<ReturnType<typeof sold.get>>) => ({
      id: entry.product?.id ?? entry.name,
      name: entry.name,
      image: entry.product?.image ?? "",
      qty: entry.qty,
      revenue: entry.revenue,
      recentQty: entry.recentQty,
      recentRevenue: entry.recentRevenue,
      stockLeft: entry.product?.variants?.length ? totalStock(entry.product.variants) : null,
    });
    const entries = [...sold.values()];
    const hotSelling = entries
      .filter((entry) => entry.recentQty > 0)
      .sort((a, b) => b.recentQty - a.recentQty || b.recentRevenue - a.recentRevenue)
      .slice(0, 8)
      .map(row);

    // In stock and visible, but nothing sold in the last 30 days.
    const soldRecently = new Set(entries.filter((entry) => entry.recentQty > 0 && entry.product).map((entry) => entry.product!.id));
    const slowMovers = tracked
      .filter((product) => product.active !== false && totalStock(product.variants) > 0 && !soldRecently.has(product.id))
      .sort((a, b) => totalStock(b.variants) - totalStock(a.variants))
      .slice(0, 8)
      .map((product) => ({ id: product.id, name: product.name, image: product.image, stock: totalStock(product.variants) }));

    return NextResponse.json({
      summary: {
        totalProducts: products.length,
        activeProducts: products.filter((product) => product.active !== false).length,
        untrackedProducts: products.length - tracked.length,
        unitsInStock,
        stockValue,
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        unitsSold,
        unitsSoldRecent,
      },
      lowStockLimit: LOW_STOCK,
      recentDays: RECENT_DAYS,
      hotSelling,
      slowMovers,
      outOfStock,
      lowStock: lowStock.slice(0, 20),
      byType: [...byType.entries()]
        .map(([name, value]) => ({ name, ...value }))
        .sort((a, b) => b.sold - a.sold || b.inStock - a.inStock),
    });
  } catch (err) {
    console.error("Inventory analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch inventory analytics." }, { status: 500 });
  }
}
