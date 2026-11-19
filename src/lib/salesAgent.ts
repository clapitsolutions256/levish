import { getActiveProducts } from "@/lib/catalog";
import { SHIPPING_FEE, SHIPPING_THRESHOLD } from "@/lib/shipping";
import { SITE_URL } from "@/lib/site";
import { cleanEnv } from "@/lib/whatsapp";
import { loadChat, saveChat, type Turn } from "@/lib/whatsappStore";
import { placeOrder, prepareOrder, summaryText, type PrepareInput } from "@/lib/whatsappOrders";

// The WhatsApp sales agent: Gemini answers questions about the live catalog and collects order details.
// Prices, stock and totals come from the database (lib/whatsappOrders), never from the model.
// The customer's phone number is never sent to Gemini.

const FALLBACK =
  "Assalam o Alaikum! Levish mein khush aamdeed 💚 Hamari team jald aap se rabta karegi. Tab tak aap " +
  `${SITE_URL} par saare products dekh sakti hain.`;

const rs = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

/** The price exactly as the product page shows it: the price to pay, and the struck-through original when discounted. */
function priceText(price: number, compareAtPrice?: number, salePercent?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return `PRICE ${rs(price)}`;
  const percent = salePercent || Math.round((1 - price / compareAtPrice) * 100);
  return `PRICE ${rs(price)} after ${percent}% discount (original ${rs(compareAtPrice)})`;
}

async function catalog() {
  // getActiveProducts already applies sales, so price is what the customer pays, as on the website.
  const products = (await getActiveProducts()).slice(0, 300);
  // Every rupee amount the agent may say: prices, originals and the delivery rule.
  const amounts = new Set<number>([SHIPPING_FEE, SHIPPING_THRESHOLD]);
  const text = products
    .map((p) => {
      // A few pieces of the same item, with or without delivery, are fair answers to "2 piece kitne ke?".
      for (let qty = 1; qty <= 5; qty++) {
        amounts.add(p.price * qty);
        amounts.add(p.price * qty + SHIPPING_FEE);
      }
      if (p.compareAtPrice) amounts.add(p.compareAtPrice);
      const inStock = (p.variants ?? []).filter((v) => v.stock > 0);
      const sizes = [...new Set(inStock.map((v) => v.size).filter(Boolean))].join(", ");
      const colors = [...new Set(inStock.map((v) => v.color).filter(Boolean))].join(", ");
      const stock = p.variants?.length ? (inStock.length ? `sizes: ${sizes || "-"}; colors: ${colors || p.color}` : "OUT OF STOCK") : `color: ${p.color}`;
      return `- ${p.name} | slug: ${p.slug} | ${priceText(p.price, p.compareAtPrice, p.salePercent)} | ${stock} | ${SITE_URL}/product/${p.slug}`;
    })
    .join("\n");
  return { text, amounts };
}

/** Rupee amounts in a reply that are not in the catalog (a price the model made up). */
function unknownAmounts(reply: string, amounts: Set<number>) {
  const found = [...reply.matchAll(/(?:rs\.?|pkr|rupees?)\s*([\d,]+)/gi)].map((m) => Number(m[1].replace(/,/g, "")));
  return found.filter((n) => n > 0 && !amounts.has(n));
}

function systemPrompt(catalog: string, pendingSummary: string | null) {
  return `You are Levish's WhatsApp sales assistant. Levish is an online women's clothing and lingerie store in Pakistan (${SITE_URL}).

LANGUAGE: Reply in the customer's language (Roman Urdu, Urdu or English). Keep replies short and friendly, like a helpful shop assistant on WhatsApp. Use at most one or two emojis.

FACTS YOU MAY USE:
- Delivery all over Pakistan. Delivery charge Rs ${SHIPPING_FEE}; free delivery on orders of Rs ${SHIPPING_THRESHOLD} or more.
- Payment: cash on delivery (COD) or bank transfer.
- Current catalog (name | slug | price | available sizes/colors | link):
${catalog || "(catalog unavailable right now)"}

RULES:
- Only state prices, sizes, colors and stock that appear in the catalog above. If something is not listed, say you will check with the team.
- PRICES: always quote the exact PRICE from the catalog, digit for digit; never round, estimate or calculate a different number. When a product shows a discount, say the price is after the discount and mention the original, for example: "Rs 2,940 (51% discount ke baad, asal qeemat Rs 6,000)".
- Match the product the customer names to the closest catalog name; if several products fit (for example several bras), list the matching ones with their prices.
- Never invent discounts, delivery times, policies or order confirmations.
- Never ask for card numbers, passwords or bank account details.
- If the customer is upset, has a complaint, or asks for a human, say a team member will reply soon.

TAKING AN ORDER:
- When the customer wants to buy, collect, one or two questions at a time: product, size and color (only from the in-stock options), quantity, full name, full delivery address, city, and payment method (COD or bank transfer). Email is optional; do not insist. Do not ask for a phone number: the order uses this WhatsApp number.
- Once you have everything, call prepare_order with the product slugs from the catalog. The system then sends the customer an order summary with the total; do not write your own summary or total.
- If prepare_order returns an error, ask the customer for what it says is missing or wrong.
- Call confirm_order ONLY when the customer clearly says yes to the summary (haan, yes, confirm, ok kar dein). If they want a change, call prepare_order again with the change.
- Never tell the customer an order is placed unless confirm_order succeeded.
${pendingSummary ? `\nAN ORDER SUMMARY IS WAITING FOR THE CUSTOMER'S ANSWER:\n${pendingSummary}\n` : ""}`;
}

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "prepare_order",
        description:
          "Check the order against live prices and stock and show the customer a summary with the total. Call when you have the product(s), size, color, quantity, full name, address, city and payment method.",
        parameters: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product_slug: { type: "string", description: "The slug from the catalog" },
                  size: { type: "string" },
                  color: { type: "string" },
                  quantity: { type: "integer" },
                },
                required: ["product_slug"],
              },
            },
            full_name: { type: "string" },
            address: { type: "string", description: "Full street address" },
            city: { type: "string" },
            payment_method: { type: "string", enum: ["cod", "transfer"] },
            email: { type: "string", description: "Optional" },
          },
          required: ["items", "full_name", "address", "city", "payment_method"],
        },
      },
      {
        name: "confirm_order",
        description: "Place the order from the summary the customer has just agreed to. Only after a clear yes.",
        parameters: { type: "object", properties: {} },
      },
    ],
  },
];

type Part = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> }; thought?: boolean };
type Content = { role: string; parts: Part[] };

async function callGemini(apiKey: string, models: string[], body: unknown) {
  const json = JSON.stringify(body);
  // The free tier answers 503 (busy) or 429 (rate limit) at peak times; those usually clear within seconds.
  let response: Response | undefined;
  models: for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    for (const wait of [0, 1500, 4000]) {
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: json,
      });
      if (response.status !== 503 && response.status !== 429) break models;
    }
  }
  if (!response || !response.ok) throw new Error(`Gemini ${response?.status}: ${await response?.text()}`);
  const data = (await response.json()) as { candidates?: { content?: Content }[] };
  return data.candidates?.[0]?.content ?? { role: "model", parts: [] };
}

/** Builds the reply for one customer message. Falls back to a fixed greeting if Gemini is not configured or fails. */
export async function replyTo(phone: string, text: string, messageId: string) {
  const apiKey = cleanEnv(process.env.GEMINI_API_KEY);
  const models = [cleanEnv(process.env.GEMINI_MODEL) || "gemini-flash-latest", cleanEnv(process.env.GEMINI_FALLBACK_MODEL)].filter(Boolean);
  if (!apiKey) return FALLBACK;

  const chat = await loadChat(phone);
  const history: Turn[] = [...chat.history, { role: "user", text: text.slice(0, 2000) }];
  const finish = async (reply: string) => {
    await saveChat(phone, { history: [...history, { role: "model", text: reply }], draft: chat.draft });
    return reply;
  };

  try {
    const { text: catalogLines, amounts } = await catalog();
    if (chat.draft) [chat.draft.subtotal, chat.draft.total, ...chat.draft.items.map((i) => i.price * i.quantity)].forEach((n) => amounts.add(n));
    const system = systemPrompt(catalogLines, chat.draft ? summaryText(chat.draft, phone) : null);
    const contents: Content[] = history.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
    let priceRetries = 0;

    // At most a few rounds per message; the model's own parts go back verbatim (Gemini needs its thought signatures).
    for (let round = 0; round < 5; round++) {
      const content = await callGemini(apiKey, models, {
        systemInstruction: { parts: [{ text: system }] },
        contents,
        tools: TOOLS,
        generationConfig: { maxOutputTokens: 600, temperature: 0.2 },
      });
      const call = content.parts.find((p) => p.functionCall)?.functionCall;
      if (!call) {
        const reply = content.parts.filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
        if (!reply) throw new Error("Gemini returned no text");
        // A made-up price never reaches the customer: ask once more, then fall back to a reply without prices.
        const wrong = unknownAmounts(reply, amounts);
        if (wrong.length) {
          console.warn("[whatsapp] reply had prices not in the catalog", { wrong });
          if (priceRetries++ < 1) {
            contents.push({ role: "model", parts: [{ text: reply }] });
            contents.push({
              role: "user",
              parts: [{ text: `[System check, not from the customer] Your reply mentions ${wrong.map(rs).join(", ")}, which is not a price in the catalog. Rewrite the same reply using only the exact PRICE values from the catalog.` }],
            });
            continue;
          }
          return await finish("Ji, yeh available hai 😊 Exact qeemat aur sizes product page par dekh lein, ya batayein kaun sa size aur color chahiye, main order bana deti hoon.");
        }
        return await finish(reply);
      }

      let result: Record<string, unknown>;
      if (call.name === "prepare_order") {
        const prepared = await prepareOrder((call.args ?? {}) as PrepareInput, messageId);
        if ("draft" in prepared) {
          chat.draft = prepared.draft;
          console.log("[whatsapp] order summary sent", { items: prepared.draft.items.length, total: prepared.draft.total });
          return await finish(summaryText(prepared.draft, phone));
        }
        result = { ok: false, error: prepared.error };
      } else if (call.name === "confirm_order") {
        if (!chat.draft) {
          result = { ok: false, error: "There is no order summary yet. Collect the details and call prepare_order first." };
        } else {
          const placed = await placeOrder(chat.draft, phone, messageId);
          if ("text" in placed) {
            console.log("[whatsapp] order placed", { total: chat.draft.total });
            chat.draft = null;
            return await finish(placed.text);
          }
          result = { ok: false, error: placed.error };
        }
      } else {
        result = { ok: false, error: `Unknown tool ${call.name}` };
      }
      contents.push({ role: "model", parts: content.parts });
      contents.push({ role: "user", parts: [{ functionResponse: { name: call.name, response: result } } as Part] });
    }
    throw new Error("Too many tool rounds");
  } catch (error) {
    console.error("[whatsapp] reply failed", error);
    return FALLBACK;
  }
}
