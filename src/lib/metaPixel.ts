export const META_PIXEL_ID = "2346883336121456";
const CURRENCY = "PKR";

type MetaParams = Record<string, unknown>;

export type MetaContent = {
  id: string;
  quantity: number;
  item_price: number;
};

function send(event: string, params?: MetaParams, eventId?: string) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) window.fbq("track", event, params ?? {}, { eventID: eventId });
  else if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

function contentsValue(contents: MetaContent[]) {
  return contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0);
}

function contentPayload(contents: MetaContent[], extra?: MetaParams): MetaParams {
  return {
    content_ids: contents.map((item) => item.id),
    content_type: "product",
    contents,
    currency: CURRENCY,
    value: contentsValue(contents),
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    ...extra,
  };
}

export function identifyMetaUser(user: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  externalId?: string;
}) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const data: Record<string, string> = { country: "pk" };
  const email = user.email?.trim().toLowerCase();
  const phone = normalizePhone(user.phone);
  const firstName = user.firstName?.trim().toLowerCase();
  const lastName = user.lastName?.trim().toLowerCase();
  const city = user.city?.trim().toLowerCase().replace(/\s+/g, "");
  const state = user.state?.trim().toLowerCase().replace(/\s+/g, "");
  const postalCode = user.postalCode?.trim();
  if (email) data.em = email;
  if (phone) data.ph = phone;
  if (firstName) data.fn = firstName;
  if (lastName) data.ln = lastName;
  if (city) data.ct = city;
  if (state) data.st = state;
  if (postalCode) data.zp = postalCode;
  if (user.externalId) data.external_id = user.externalId;
  window.fbq("init", META_PIXEL_ID, data);
}

function normalizePhone(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export function trackViewContent(product: { id: string; name: string; category?: string; price: number }) {
  send(
    "ViewContent",
    contentPayload([{ id: product.id, quantity: 1, item_price: product.price }], {
      content_name: product.name,
      content_category: product.category,
    })
  );
}

export function trackCatalogView(input: { name: string; category: string; ids: string[] }) {
  const ids = input.ids.filter(Boolean).slice(0, 10);
  if (!ids.length) return;
  send("ViewContent", {
    content_ids: ids,
    content_type: "product",
    content_name: input.name,
    content_category: input.category,
  });
}

export function trackAddToCart(product: { id: string; name: string; category?: string; price: number }, quantity = 1) {
  send(
    "AddToCart",
    contentPayload([{ id: product.id, quantity, item_price: product.price }], {
      content_name: product.name,
      content_category: product.category,
    })
  );
}

export function trackSearch(searchString: string, ids: string[]) {
  const query = searchString.trim();
  if (!query) return;
  send("Search", {
    search_string: query,
    content_ids: ids.slice(0, 10),
    content_type: "product",
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(contents: MetaContent[], value?: number) {
  if (!contents.length) return;
  send("InitiateCheckout", contentPayload(contents, value == null ? undefined : { value }));
}

export function trackAddPaymentInfo(contents: MetaContent[], value?: number) {
  if (!contents.length) return;
  send("AddPaymentInfo", contentPayload(contents, value == null ? undefined : { value }));
}

export function trackPurchase(orderId: string, contents: MetaContent[], value: number) {
  if (!orderId || !contents.length) return;
  const key = `meta_purchase_${orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // Still send the event if storage is blocked. The order id is the dedupe key.
  }
  send(
    "Purchase",
    contentPayload(contents, { value, order_id: orderId }),
    orderId
  );
}

export function trackCompleteRegistration(email?: string) {
  send("CompleteRegistration", { status: true, content_name: "Empulse account", currency: CURRENCY });
  if (email) identifyMetaUser({ email });
}
