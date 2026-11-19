import { getActiveProducts } from "@/lib/catalog";
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "@/lib/shipping";
import { SITE_URL } from "@/lib/site";
import { cleanEnv } from "@/lib/whatsapp";

// Phase 1 of the WhatsApp sales agent: answers questions about the live catalog with Gemini.
// It does not take orders yet. The customer's phone number is never sent to Gemini.

type Turn = { role: "user" | "model"; text: string };

// Short per-customer memory, kept in this server process only. It is lost on restart and not shared
// between processes; Phase 2 moves it to Supabase.
const MEMORY_TURNS = 12;
const memory = new Map<string, { turns: Turn[]; at: number }>();
const MEMORY_TTL_MS = 24 * 60 * 60 * 1000;

function remember(key: string, turn: Turn) {
  const now = Date.now();
  for (const [k, v] of memory) if (now - v.at > MEMORY_TTL_MS) memory.delete(k);
  const entry = memory.get(key) ?? { turns: [], at: now };
  entry.turns.push(turn);
  entry.turns = entry.turns.slice(-MEMORY_TURNS);
  entry.at = now;
  memory.set(key, entry);
  return entry.turns;
}

const FALLBACK =
  "Assalam o Alaikum! Levish mein khush aamdeed 💚 Hamari team jald aap se rabta karegi. Tab tak aap " +
  `${SITE_URL} par saare products dekh sakti hain.`;

async function catalogText() {
  const products = await getActiveProducts();
  return products
    .slice(0, 60)
    .map((p) => {
      const inStock = (p.variants ?? []).filter((v) => v.stock > 0);
      const sizes = [...new Set(inStock.map((v) => v.size).filter(Boolean))].join(", ");
      const colors = [...new Set(inStock.map((v) => v.color).filter(Boolean))].join(", ");
      const stock = p.variants?.length ? (inStock.length ? `sizes: ${sizes || "-"}; colors: ${colors || p.color}` : "OUT OF STOCK") : `color: ${p.color}`;
      return `- ${p.name} | Rs ${p.price}${p.compareAtPrice ? ` (was Rs ${p.compareAtPrice})` : ""} | ${stock} | ${SITE_URL}/product/${p.slug}`;
    })
    .join("\n");
}

function systemPrompt(catalog: string) {
  return `You are Levish's WhatsApp sales assistant. Levish is an online women's clothing and lingerie store in Pakistan (${SITE_URL}).

LANGUAGE: Reply in the customer's language (Roman Urdu, Urdu or English). Keep replies short and friendly, like a helpful shop assistant on WhatsApp. Use at most one or two emojis.

FACTS YOU MAY USE:
- Delivery all over Pakistan. Delivery charge Rs ${SHIPPING_FEE}; free delivery on orders of Rs ${SHIPPING_THRESHOLD} or more.
- Current catalog (name | price | available sizes/colors | link):
${catalog || "(catalog unavailable right now)"}

RULES:
- Only state prices, sizes, colors and stock that appear in the catalog above. If something is not listed, say you will check with the team.
- Never invent discounts, delivery times, policies or order confirmations.
- You cannot place orders yet: when the customer wants to buy, share the product link so they can order on the website, or say the team will confirm the order on WhatsApp.
- Never ask for card numbers, passwords or bank details.
- If the customer is upset, has a complaint, or asks for a human, say a team member will reply soon.`;
}

/** Builds the reply for one customer message. Falls back to a fixed greeting if Gemini is not configured or fails. */
export async function replyTo(customerKey: string, text: string) {
  const apiKey = cleanEnv(process.env.GEMINI_API_KEY);
  // A second model to try when the first stays busy; optional.
  const models = [cleanEnv(process.env.GEMINI_MODEL) || "gemini-flash-latest", cleanEnv(process.env.GEMINI_FALLBACK_MODEL)].filter(Boolean);
  if (!apiKey) return FALLBACK;

  const turns = remember(customerKey, { role: "user", text: text.slice(0, 2000) });
  try {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(await catalogText()) }] },
      contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
    });
    // The free tier answers 503 (busy) or 429 (rate limit) at peak times; those usually clear within seconds.
    let response: Response | undefined;
    models: for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      for (const wait of [0, 1500, 4000]) {
        if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body,
        });
        if (response.status !== 503 && response.status !== 429) break models;
      }
    }
    if (!response || !response.ok) throw new Error(`Gemini ${response?.status}: ${await response?.text()}`);
    const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const reply = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
    if (!reply) throw new Error("Gemini returned no text");
    remember(customerKey, { role: "model", text: reply });
    return reply;
  } catch (error) {
    console.error("[whatsapp] Gemini reply failed", error);
    return FALLBACK;
  }
}
