const GUEST_KEY = "empulse_cart";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let memoryToken = "";

export function ensureGuestToken() {
  if (typeof window === "undefined") return "";
  if (memoryToken && UUID.test(memoryToken)) return memoryToken;
  const existing = localStorage.getItem(GUEST_KEY);
  if (existing && UUID.test(existing)) {
    memoryToken = existing;
    return existing;
  }
  memoryToken = crypto.randomUUID();
  localStorage.setItem(GUEST_KEY, memoryToken);
  return memoryToken;
}

export function rememberGuestToken(token?: string) {
  if (typeof window === "undefined" || !token || !UUID.test(token)) return;
  memoryToken = token;
  localStorage.setItem(GUEST_KEY, token);
}

const SNAPSHOT_KEY = "empulse_cart_items";

type SnapshotLine = {
  product: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    image: string;
    color?: string;
    categoryId?: string;
  };
  quantity: number;
  size?: string;
  color?: string;
};

export function slimCartSnapshot(items: SnapshotLine[]) {
  return items
    .filter((item) => item?.product?.id && item.product.name && item.product.image && item.quantity > 0)
    .map((item) => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug || item.product.id,
        price: item.product.price,
        image: item.product.image,
        color: item.product.color || "",
        categoryId: item.product.categoryId || "women",
      },
      quantity: Math.min(20, item.quantity),
      size: item.size || "",
      color: item.color || "",
    }));
}

export function readCartSnapshot<T>() {
  if (typeof window === "undefined") return [] as T[];
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [] as T[];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as T[];
  }
}

export function readCartCookie(value?: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? slimCartSnapshot(parsed) : [];
  } catch {
    return [];
  }
}

export function writeCartSnapshot(items: SnapshotLine[]) {
  if (typeof window === "undefined") return;
  const slim = slimCartSnapshot(items);
  const json = JSON.stringify(slim);
  localStorage.setItem(SNAPSHOT_KEY, json);
  const encoded = encodeURIComponent(json);
  if (encoded.length > 3500) return;
  document.cookie = `${SNAPSHOT_KEY}=${encoded}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export { GUEST_KEY };
