import { after } from "next/server";
import { incomingMessages, sendText, validSignature } from "@/lib/whatsapp";
import { replyTo } from "@/lib/salesAgent";
import { firstSighting } from "@/lib/whatsappStore";

// Meta WhatsApp Cloud API webhook. Callback URL: https://www.levish.store/api/whatsapp
// (www matters: the bare domain answers with a redirect, which Meta does not follow).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Meta's one-time check when the callback URL is saved in the app dashboard. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (
    verifyToken &&
    params.get("hub.mode") === "subscribe" &&
    params.get("hub.verify_token") === verifyToken
  ) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!validSignature(raw, signature)) {
    // No secrets or message content here: only enough to tell a wrong app secret from a stray request.
    console.warn("[whatsapp] rejected webhook: bad signature", {
      hasSignature: Boolean(signature),
      appSecretSet: Boolean(process.env.WHATSAPP_APP_SECRET),
    });
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Delivery and read receipts carry no messages; only customer messages are logged and answered.
  const messages = incomingMessages(payload);
  if (messages.length) console.log("[whatsapp] webhook received", { messages: messages.length, types: messages.map((m) => m.type) });

  // Answer Meta at once; replying can take a few seconds and Meta retries slow webhooks.
  after(async () => {
    for (const message of messages) {
      try {
        // Meta retries a webhook it thinks failed, so the same message can arrive twice.
        if (!(await firstSighting(message.id))) continue;
        const reply = message.text
          ? await replyTo(message.from, message.text, message.id)
          : "Shukriya! Abhi main sirf text messages parh sakti hoon. Apna sawal likh kar bhej dein 💚";
        await sendText(message.from, reply);
      } catch (error) {
        console.error("[whatsapp] could not answer message", message.id, error);
      }
    }
  });

  return new Response("OK", { status: 200 });
}
