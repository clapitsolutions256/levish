import crypto from "node:crypto";
import { META_PIXEL_ID } from "@/lib/metaPixel";
import { SITE_URL } from "@/lib/site";

// Meta Conversions API: the server also reports each Purchase, so an order still counts when the
// browser pixel is blocked (ad blockers, iOS privacy). The browser sends the same event with the
// order id as its eventID, and Meta keeps one of the two.
// META_CAPI_TOKEN comes from Events Manager > dataset > Settings > Conversions API > Generate access token.
// META_CAPI_TEST_CODE (optional) sends events to the Test events tab instead of live data.

const GRAPH_VERSION = "v25.0";

const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

/** Meta's normalisation before hashing: trimmed, lower case; names and cities without spaces. */
function hashed(value: string | undefined, squash = false) {
  let clean = (value ?? "").trim().toLowerCase();
  if (squash) clean = clean.replace(/\s+/g, "");
  return clean ? [sha256(clean)] : undefined;
}

/** Pakistani numbers in international form without "+" (e.g. 923001234567), as the browser pixel sends them. */
function phoneDigits(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

function cookie(header: string, name: string) {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/** What the request tells Meta about the shopper's browser; read before the response is sent. */
export function capiRequestContext(request: Request) {
  const cookies = request.headers.get("cookie") ?? "";
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    ip: forwarded || request.headers.get("x-real-ip") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    fbp: cookie(cookies, "_fbp"),
    fbc: cookie(cookies, "_fbc"),
    sourceUrl: request.headers.get("referer") || `${SITE_URL}/checkout`,
  };
}

export type CapiPurchase = {
  orderId: string;
  value: number;
  contents: { id: string; quantity: number; item_price: number }[];
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  customerId?: string;
  context: ReturnType<typeof capiRequestContext>;
};

/** Reports a placed order to Meta. Never throws: tracking must not affect the order. */
export async function sendCapiPurchase(order: CapiPurchase) {
  const token = (process.env.META_CAPI_TOKEN ?? "").trim();
  if (!token || !order.orderId) return false;

  const phone = phoneDigits(order.phone);
  const event = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: order.orderId,
    action_source: "website",
    event_source_url: order.context.sourceUrl,
    user_data: {
      em: hashed(order.email),
      ph: phone ? [sha256(phone)] : undefined,
      fn: hashed(order.firstName),
      ln: hashed(order.lastName),
      ct: hashed(order.city, true),
      st: hashed(order.state, true),
      zp: hashed(order.postalCode, true),
      country: [sha256("pk")],
      external_id: hashed(order.customerId),
      client_ip_address: order.context.ip,
      client_user_agent: order.context.userAgent,
      fbp: order.context.fbp,
      fbc: order.context.fbc,
    },
    custom_data: {
      currency: "PKR",
      value: order.value,
      order_id: order.orderId,
      content_type: "product",
      content_ids: order.contents.map((item) => item.id),
      contents: order.contents,
      num_items: order.contents.reduce((sum, item) => sum + item.quantity, 0),
    },
  };

  try {
    const testCode = (process.env.META_CAPI_TEST_CODE ?? "").trim();
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${META_PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: [event], ...(testCode ? { test_event_code: testCode } : {}) }),
    });
    if (!response.ok) {
      console.error("[meta capi] Purchase not accepted", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[meta capi] Purchase failed", error);
    return false;
  }
}
