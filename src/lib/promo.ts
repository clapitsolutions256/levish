import { getSupabase } from "@/lib/supabase";
import { promoDiscount, salePrice } from "@/lib/sale";

export type PromoType = "percent" | "fixed";

export type Promo = {
  code: string;
  owner: string;
  type: PromoType;
  value: number;
  minOrder: number;
  maxUses: number | null;
  oncePerCustomer: boolean;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

export type PromoWithStats = Promo & { uses: number; sales: number; discountGiven: number };

type PromoRow = {
  code: string;
  owner: string;
  type: PromoType;
  value: number;
  min_order: number;
  max_uses: number | null;
  once_per_customer: boolean;
  expires_at: string | null;
  active: boolean;
  created_at: string;
};

function toPromo(row: PromoRow): Promo {
  return {
    code: row.code,
    owner: row.owner,
    type: row.type,
    value: Number(row.value),
    minOrder: Number(row.min_order),
    maxUses: row.max_uses,
    oncePerCustomer: row.once_per_customer,
    expiresAt: row.expires_at,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function cleanCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

// The table comes from supabase/promo-codes.sql; say so plainly if it has not been run.
export function missingTable(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "42P01" || code === "PGRST205" || code === "42703";
}

export function cleanPromo(body: Record<string, unknown>, partial = false) {
  const value: Partial<PromoRow> = {};

  if (!partial || body.code !== undefined) {
    const code = cleanCode(body.code);
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) {
      return { error: "Use 3 to 20 letters or numbers for the code, e.g. ALI10." as const };
    }
    value.code = code;
  }
  if (body.owner !== undefined) value.owner = String(body.owner ?? "").trim().slice(0, 80);
  if (!partial || body.type !== undefined || body.value !== undefined) {
    const type = body.type === "fixed" ? "fixed" : "percent";
    const amount = Math.floor(Number(body.value) || 0);
    if (amount < 1) return { error: "Enter the discount." as const };
    if (type === "percent" && amount > 90) return { error: "A percentage discount can be at most 90%." as const };
    value.type = type;
    value.value = amount;
  }
  if (body.minOrder !== undefined) value.min_order = Math.max(0, Math.floor(Number(body.minOrder) || 0));
  if (body.maxUses !== undefined) {
    const uses = Math.floor(Number(body.maxUses) || 0);
    value.max_uses = uses > 0 ? uses : null;
  }
  if (body.oncePerCustomer !== undefined) value.once_per_customer = Boolean(body.oncePerCustomer);
  if (body.expiresAt !== undefined) {
    const date = String(body.expiresAt ?? "").trim();
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose a valid expiry date." as const };
    // The code works until the end of that day in Pakistan.
    value.expires_at = date ? `${date}T23:59:59+05:00` : null;
  }
  if (body.active !== undefined) value.active = Boolean(body.active);
  return { value };
}

export async function listPromos(): Promise<PromoWithStats[]> {
  const supabase = getSupabase();
  const [promos, orders] = await Promise.all([
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("promo_code, total, discount").not("promo_code", "is", null).neq("status", "cancelled"),
  ]);
  if (promos.error) throw promos.error;
  if (orders.error) throw orders.error;

  const stats = new Map<string, { uses: number; sales: number; discountGiven: number }>();
  for (const order of orders.data ?? []) {
    const entry = stats.get(order.promo_code) ?? { uses: 0, sales: 0, discountGiven: 0 };
    entry.uses += 1;
    entry.sales += Number(order.total) || 0;
    entry.discountGiven += Number(order.discount) || 0;
    stats.set(order.promo_code, entry);
  }
  return ((promos.data ?? []) as PromoRow[]).map((row) => ({
    ...toPromo(row),
    ...(stats.get(row.code) ?? { uses: 0, sales: 0, discountGiven: 0 }),
  }));
}

type PricedLine = { productId?: string; quantity?: number };

// Promo discounts are worked out from the prices in the database, never the browser's.
export async function serverSubtotal(lines: PricedLine[]) {
  const ids = [...new Set(lines.map((line) => String(line.productId ?? "").trim()))];
  if (!lines.length || ids.includes("")) return null;
  const { data, error } = await getSupabase().from("products").select("id, price, sale_percent").in("id", ids);
  if (error) throw error;
  const prices = new Map((data ?? []).map((row) => [row.id, salePrice(Number(row.price), Number(row.sale_percent) || 0)]));
  let subtotal = 0;
  for (const line of lines) {
    const price = prices.get(String(line.productId ?? "").trim());
    if (price === undefined) return null;
    subtotal += price * Math.max(1, Math.floor(Number(line.quantity) || 1));
  }
  return subtotal;
}

export async function checkPromo(input: { code: unknown; subtotal: number; email?: string; phone?: string }) {
  const code = cleanCode(input.code);
  const invalid = { error: "This promo code is not valid." };
  if (!code) return invalid;

  const supabase = getSupabase();
  const { data, error } = await supabase.from("promo_codes").select("*").eq("code", code).maybeSingle();
  if (error) {
    if (missingTable(error)) return invalid;
    throw error;
  }
  if (!data || !data.active) return invalid;
  const promo = toPromo(data as PromoRow);

  if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
    return { error: "This promo code has expired." };
  }
  if (input.subtotal < promo.minOrder) {
    return { error: `This code works on orders of Rs. ${promo.minOrder.toLocaleString("en-PK")} or more.` };
  }

  if (promo.maxUses) {
    const { count, error: countError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("promo_code", code)
      .neq("status", "cancelled");
    if (countError) throw countError;
    if ((count ?? 0) >= promo.maxUses) return { error: "This promo code has been fully used." };
  }

  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  if (promo.oncePerCustomer) {
    // A customer is the same person if either their email or their phone matches.
    const checks = (
      [
        ["email", email],
        ["phone", phone],
      ] as const
    )
      .filter(([, value]) => value)
      .map(([column, value]) =>
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("promo_code", code)
          .neq("status", "cancelled")
          .eq(column, value!)
      );
    for (const { count, error: countError } of await Promise.all(checks)) {
      if (countError) throw countError;
      if ((count ?? 0) > 0) return { error: "You have already used this promo code." };
    }
  }

  return { promo, discount: promoDiscount(promo, input.subtotal) };
}
