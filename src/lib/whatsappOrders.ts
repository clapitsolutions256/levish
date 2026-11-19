import { getSupabase } from "@/lib/supabase";
import { salePrice } from "@/lib/sale";
import { shippingFor } from "@/lib/shipping";
import { findVariant, normalizeVariants } from "@/lib/variants";
import { reserveStock, restoreStock } from "@/lib/stock";
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/email";
import { bankTransfer } from "@/data/payment";
import { PRODUCTS_PAUSED } from "@/lib/storeStatus";

// Orders taken on WhatsApp. The AI only collects the details; every price, stock check and total
// is worked out here from the database, and the order is placed the same way as website checkout.

export type DraftItem = {
  productId: string;
  name: string;
  slug: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderDraft = {
  items: DraftItem[];
  fullName: string;
  address: string;
  city: string;
  email: string;
  paymentMethod: "cod" | "transfer";
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  /** The WhatsApp message that produced this summary; the "yes" must come in a later message. */
  messageId: string;
};

export type PrepareInput = {
  items?: { product_slug?: string; size?: string; color?: string; quantity?: number }[];
  full_name?: string;
  address?: string;
  city?: string;
  payment_method?: string;
  email?: string;
};

const DRAFT_TTL_MS = 6 * 60 * 60 * 1000;
const rs = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;
const clean = (value: unknown, max = 200) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_percent: number | null;
  color: string | null;
  image: string | null;
  variants: unknown;
  active: boolean;
};

/** Checks the customer's choices against the live catalog and works out the totals. Nothing is reserved yet. */
export async function prepareOrder(input: PrepareInput, messageId: string): Promise<{ draft: OrderDraft } | { error: string }> {
  if (PRODUCTS_PAUSED) return { error: "The store is not taking orders right now." };
  const fullName = clean(input.full_name, 100);
  const address = clean(input.address, 300);
  const city = clean(input.city, 80);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(input.email)) ? clean(input.email).toLowerCase() : "";
  const paymentMethod = clean(input.payment_method).toLowerCase().startsWith("transfer") ? "transfer" : "cod";
  const missing = [!fullName && "full name", !address && "full delivery address", !city && "city"].filter(Boolean);
  const wanted = (input.items ?? []).filter((item) => clean(item.product_slug));
  if (!wanted.length) missing.unshift("which product");
  if (missing.length) return { error: `Ask the customer for: ${missing.join(", ")}.` };

  const slugs = [...new Set(wanted.map((item) => clean(item.product_slug)))];
  const { data, error } = await getSupabase()
    .from("products")
    .select("id, name, slug, price, sale_percent, color, image, variants, active")
    .in("slug", slugs);
  if (error) throw error;
  const bySlug = new Map(((data ?? []) as ProductRow[]).map((row) => [row.slug, row]));

  const items: DraftItem[] = [];
  for (const want of wanted) {
    const product = bySlug.get(clean(want.product_slug));
    if (!product || !product.active) return { error: `No product with slug "${clean(want.product_slug)}". Use a slug from the catalog.` };
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(want.quantity) || 1)));
    const variants = normalizeVariants(product.variants);
    let size = clean(want.size, 40);
    let color = clean(want.color, 40);
    if (variants.length) {
      const inStock = variants.filter((v) => v.stock > 0);
      const sizes = [...new Set(inStock.map((v) => v.size))];
      const colors = [...new Set(inStock.map((v) => v.color))];
      // Fill in the only option when there is just one, so the customer is not asked needlessly.
      if (!size && sizes.length === 1) size = sizes[0];
      if (!color && colors.length === 1) color = colors[0];
      const match = findVariant(variants, size, color);
      if (!match) {
        return {
          error: `${product.name}: ask the customer to choose an available size and color. In stock: ${inStock.map((v) => `${v.color} ${v.size} (${v.stock})`).join(", ") || "nothing"}.`,
        };
      }
      size = match.size;
      color = match.color;
      if (match.stock < quantity) {
        return { error: `${product.name} ${color} ${size}: only ${match.stock} in stock.` };
      }
    } else {
      color = color || clean(product.color, 40);
    }
    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      size,
      color,
      price: salePrice(Number(product.price), Number(product.sale_percent) || 0),
      quantity,
      image: product.image ?? "",
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = shippingFor(subtotal);
  return {
    draft: {
      items,
      fullName,
      address,
      city,
      email,
      paymentMethod,
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      createdAt: new Date().toISOString(),
      messageId,
    },
  };
}

/** The summary the customer confirms. Written by the server so the AI cannot change a number. */
export function summaryText(draft: OrderDraft, phone: string) {
  const lines = draft.items.map(
    (item) =>
      `• ${item.name}${[item.color, item.size && `Size ${item.size}`].filter(Boolean).length ? ` (${[item.color, item.size && `Size ${item.size}`].filter(Boolean).join(", ")})` : ""} × ${item.quantity} = ${rs(item.price * item.quantity)}`
  );
  return [
    "🧾 *Order summary*",
    ...lines,
    `Subtotal: ${rs(draft.subtotal)}`,
    `Delivery: ${draft.shippingFee ? rs(draft.shippingFee) : "Free"}`,
    `*Total: ${rs(draft.total)}*`,
    "",
    `Naam: ${draft.fullName}`,
    `Address: ${draft.address}, ${draft.city}`,
    `Phone: +${phone}`,
    `Payment: ${draft.paymentMethod === "transfer" ? "Bank transfer" : "Cash on delivery"}`,
    "",
    "Order confirm karne ke liye *\"haan\"* likhein. Kuch badalna ho to bata dein.",
  ].join("\n");
}

/** Places the confirmed order exactly like website checkout: reserves stock, saves it, alerts the store. */
export async function placeOrder(draft: OrderDraft, phone: string, messageId: string): Promise<{ text: string } | { error: string }> {
  if (draft.messageId === messageId) return { error: "Show the customer the summary and wait for their reply before confirming." };
  if (Date.now() - new Date(draft.createdAt).getTime() > DRAFT_TTL_MS) {
    return { error: "This summary is too old. Prepare the order again so prices and stock are rechecked." };
  }

  const stock = await reserveStock(
    draft.items.map((item) => ({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity }))
  );
  if (stock.error) {
    if (stock.applied.length) await restoreStock(stock.applied);
    return { error: `${stock.error} Tell the customer and offer another size, color or product.` };
  }

  const [firstName, ...rest] = draft.fullName.split(" ");
  const orderItems = draft.items.map((item) => ({
    productId: item.productId,
    name: item.name,
    variant: item.color,
    color: item.color,
    price: item.price,
    quantity: item.quantity,
    size: item.size,
    image: item.image,
  }));
  const shipping = draft.shippingFee === 0 ? "Free" : `Rs. ${draft.shippingFee}`;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      email: draft.email,
      first_name: firstName,
      last_name: rest.join(" "),
      address: draft.address,
      apartment: "",
      city: draft.city,
      state: "",
      postal_code: "",
      phone: `+${phone}`,
      user_id: null,
      order_items: orderItems,
      subtotal: draft.subtotal,
      shipping,
      total: draft.total,
      payment_method: draft.paymentMethod,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) {
    await restoreStock(stock.applied);
    throw error;
  }
  await supabase.from("order_notes").insert({ order_id: data.id, text: `Order placed on WhatsApp from +${phone}.` });

  const placed = {
    id: data.id,
    email: draft.email,
    firstName,
    lastName: rest.join(" "),
    address: draft.address,
    city: draft.city,
    phone: `+${phone}`,
    items: orderItems,
    subtotal: draft.subtotal,
    shipping,
    total: draft.total,
    paymentMethod: draft.paymentMethod,
  };
  // The store is always alerted; the customer gets an email only if they gave one.
  await Promise.all([sendNewOrderAlert(placed), draft.email ? sendOrderConfirmation(placed) : Promise.resolve(false)]);

  const number = data.id.slice(0, 8).toUpperCase();
  const payment =
    draft.paymentMethod === "transfer"
      ? [
          "",
          "💳 *Bank transfer details*",
          `Bank: ${bankTransfer.bank}`,
          `Account title: ${bankTransfer.accountTitle}`,
          `Account number: ${bankTransfer.accountNumber}`,
          `Amount: ${rs(draft.total)}`,
          "Payment ke baad screenshot isi chat mein bhej dein.",
        ]
      : ["", `💵 Delivery par ${rs(draft.total)} cash ada karein.`];
  return {
    text: [
      `✅ Shukriya ${firstName}! Aap ka order *#${number}* confirm ho gaya.`,
      `Total: ${rs(draft.total)}`,
      ...payment,
      "",
      "Hamari team jald dispatch ki tafseel share karegi. 💚",
    ].join("\n"),
  };
}
