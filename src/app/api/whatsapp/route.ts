import { after } from "next/server";
import { incomingMessages, sendText, validSignature } from "@/lib/whatsapp";
import { replyTo } from "@/lib/salesAgent";

// Meta WhatsApp Cloud API webhook. Callback URL: https://www.levish.store/api/whatsapp
// (www matters: the bare domain answers with a redirect, which Meta does not follow).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Meta retries a webhook it thinks failed, so the same message can arrive twice.
// Remembered per server process; Phase 2 moves this to Supabase.
const seen = new Map<string, number>();
const SEEN_TTL_MS = 6 * 60 * 60 * 1000;

function firstTime(id: string) {
  const now = Date.now();
  for (const [k, at] of seen) if (now - at > SEEN_TTL_MS) seen.delete(k);
  if (!id || seen.has(id)) return false;
  seen.set(id, now);
  return true;
}

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
  if (!validSignature(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const messages = incomingMessages(payload).filter((m) => firstTime(m.id));

  // Answer Meta at once; replying can take a few seconds and Meta retries slow webhooks.
  after(async () => {
    for (const message of messages) {
      try {
        const reply = message.text
          ? await replyTo(message.from, message.text)
          : "Shukriya! Abhi main sirf text messages parh sakti hoon. Apna sawal likh kar bhej dein 💚";
        await sendText(message.from, reply);
      } catch (error) {
        console.error("[whatsapp] could not answer message", message.id, error);
      }
    }
  });

  return new Response("OK", { status: 200 });
}
