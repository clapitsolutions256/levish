import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

type Item = { name: string; price: number; quantity: number };

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("created_at, status, total, city, order_items");
    if (error) throw error;

    const dailyMap = new Map<string, { revenue: number; orders: number }>();
    const productMap = new Map<string, { totalQty: number; totalRevenue: number }>();
    const cityMap = new Map<string, { orders: number; revenue: number }>();

    for (const row of data ?? []) {
      if (row.status === "cancelled") continue;
      const created = new Date(row.created_at);
      if (created >= thirtyDaysAgo) {
        const day = created.toISOString().slice(0, 10);
        const current = dailyMap.get(day) ?? { revenue: 0, orders: 0 };
        current.revenue += Number(row.total) || 0;
        current.orders += 1;
        dailyMap.set(day, current);
      }
      const city = cityMap.get(row.city) ?? { orders: 0, revenue: 0 };
      city.orders += 1;
      city.revenue += Number(row.total) || 0;
      cityMap.set(row.city, city);
      for (const item of (row.order_items ?? []) as Item[]) {
        const product = productMap.get(item.name) ?? { totalQty: 0, totalRevenue: 0 };
        const qty = Number(item.quantity) || 0;
        product.totalQty += qty;
        product.totalRevenue += (Number(item.price) || 0) * qty;
        productMap.set(item.name, product);
      }
    }

    const daily = [...dailyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, value]) => ({ _id: id, ...value }));
    const topProducts = [...productMap.entries()]
      .sort((a, b) => b[1].totalQty - a[1].totalQty)
      .slice(0, 10)
      .map(([id, value]) => ({ _id: id, ...value }));
    const topCities = [...cityMap.entries()]
      .sort((a, b) => b[1].orders - a[1].orders)
      .slice(0, 10)
      .map(([id, value]) => ({ _id: id, ...value }));

    return NextResponse.json({ daily, topProducts, topCities });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
