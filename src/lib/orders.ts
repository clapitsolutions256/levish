import { getSupabase } from "@/lib/supabase";

export type OrderItem = {
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
};

type NoteRow = {
  id: string;
  text: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  order_items: OrderItem[];
  subtotal: number;
  shipping: string;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  order_notes?: NoteRow[] | null;
};

const ORDER_SELECT = "*, order_notes(id, text, created_at)";

export function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function toOrder(row: OrderRow) {
  const notes = [...(row.order_notes ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  return {
    _id: row.id,
    contact: { email: row.email },
    deliveryAddress: {
      firstName: row.first_name,
      lastName: row.last_name,
      address: row.address,
      apartment: row.apartment,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      phone: row.phone,
    },
    orderItems: row.order_items ?? [],
    subtotal: Number(row.subtotal),
    shipping: row.shipping,
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    notes: notes.map((note) => ({
      _id: note.id,
      text: note.text,
      createdAt: note.created_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listOrders(filter?: { status?: string | null; search?: string | null }) {
  const supabase = getSupabase();
  let query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  if (filter?.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }
  const search = filter?.search?.trim();
  if (search) {
    const safe = search.replace(/[%_,.()]/g, "");
    if (safe) {
      query = query.or(
        `email.ilike.%${safe}%,first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,phone.ilike.%${safe}%,city.ilike.%${safe}%`
      );
    }
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data as OrderRow[]).map(toOrder);
}

export async function withProductImages(items: OrderItem[]) {
  if (items.every((item) => item.image)) return items;
  const names = [...new Set(items.map((item) => item.name).filter(Boolean))];
  if (!names.length) return items;

  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").select("name, color, image").in("name", names);
  if (error || !data) return items;

  return items.map((item) => {
    if (item.image) return item;
    const matches = data.filter((product) => product.name === item.name && product.image);
    const colored = matches.find((product) => item.variant && product.color === item.variant);
    const image = (colored || matches[0])?.image;
    return image ? { ...item, image } : item;
  });
}

export async function getOrder(id: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const order = toOrder(data as OrderRow);
  order.orderItems = await withProductImages(order.orderItems);
  return order;
}
