import crypto from "node:crypto";

// WhatsApp Cloud API (Meta). Server-only: the token and app secret never reach the browser.
const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v25.0";

/** True when Meta's x-hub-signature-256 header matches the raw request body signed with the app secret. */
export function validSignature(rawBody: string, header: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return false;
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Sends a plain text reply. Only works inside the 24-hour window the customer's own message opened. */
export async function sendText(to: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.");

  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: body.slice(0, 4000) },
    }),
  });
  if (!response.ok) throw new Error(`WhatsApp send failed (${response.status}): ${await response.text()}`);
}

export interface IncomingMessage {
  id: string;
  from: string;
  type: string;
  text: string;
}

/** Pulls customer messages out of a webhook payload. Delivery/read status updates are skipped. */
export function incomingMessages(payload: unknown): IncomingMessage[] {
  const out: IncomingMessage[] = [];
  const entries = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const entry of entries as { changes?: { value?: { messages?: Record<string, unknown>[] } }[] }[]) {
    for (const change of entry.changes ?? []) {
      for (const msg of change.value?.messages ?? []) {
        const type = String(msg.type ?? "");
        const text =
          type === "text"
            ? String((msg.text as { body?: string })?.body ?? "")
            : type === "button"
              ? String((msg.button as { text?: string })?.text ?? "")
              : type === "interactive"
                ? String(
                    (msg.interactive as { button_reply?: { title?: string }; list_reply?: { title?: string } })
                      ?.button_reply?.title ??
                      (msg.interactive as { list_reply?: { title?: string } })?.list_reply?.title ??
                      ""
                  )
                : "";
        out.push({ id: String(msg.id ?? ""), from: String(msg.from ?? ""), type, text: text.trim() });
      }
    }
  }
  return out;
}
