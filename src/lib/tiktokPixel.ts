// TikTok Pixel events. The base code in the root layout loads the pixel; every Meta event the store sends
// (src/lib/metaPixel.ts) is mirrored here, so both pixels see the same funnel.

type TikTokContent = {
  content_id: string;
  content_type: "product";
  content_name?: string;
  quantity: number;
  price: number;
};

type TikTokParams = Record<string, unknown>;

declare global {
  interface Window {
    ttq?: {
      page: () => void;
      track: (event: string, params?: TikTokParams, options?: { event_id?: string }) => void;
      identify: (user: Record<string, string>) => void;
    };
  }
}

export function tiktokTrack(event: string, params?: TikTokParams, eventId?: string) {
  if (typeof window === "undefined" || typeof window.ttq?.track !== "function") return;
  if (eventId) window.ttq.track(event, params ?? {}, { event_id: eventId });
  else window.ttq.track(event, params ?? {});
}

/** TikTok's shape for products: content_id / quantity / price, plus the order value and currency. */
export function tiktokContents(
  contents: { id: string; quantity: number; item_price: number }[],
  currency: string,
  extra?: { value?: number; name?: string }
): TikTokParams {
  const items: TikTokContent[] = contents.map((item) => ({
    content_id: item.id,
    content_type: "product",
    ...(extra?.name && contents.length === 1 ? { content_name: extra.name } : {}),
    quantity: item.quantity,
    price: item.item_price,
  }));
  return {
    contents: items,
    value: extra?.value ?? contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0),
    currency,
  };
}

/** Matches events to TikTok users by email and phone; the pixel hashes them before sending. */
export function identifyTikTokUser(user: { email?: string; phone?: string; externalId?: string }) {
  if (typeof window === "undefined" || typeof window.ttq?.identify !== "function") return;
  const data: Record<string, string> = {};
  if (user.email) data.email = user.email.trim().toLowerCase();
  if (user.phone) data.phone_number = user.phone;
  if (user.externalId) data.external_id = user.externalId;
  if (Object.keys(data).length) window.ttq.identify(data);
}
