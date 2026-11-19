import { getSupabase } from "@/lib/supabase";
import type { OrderDraft } from "@/lib/whatsappOrders";

// Conversation memory for the WhatsApp agent, kept in Supabase (supabase/add-whatsapp.sql) because
// the host runs several server processes and each has its own memory. If the tables are missing,
// it falls back to this process's memory so the bot still answers.

export type Turn = { role: "user" | "model"; text: string };
export type Chat = { history: Turn[]; draft: OrderDraft | null };

const HISTORY_TURNS = 20;
const local = new Map<string, Chat>();
const localSeen = new Map<string, number>();
let warned = false;

// Housekeeping, so the tables only ever hold recent activity: answered-message ids are only needed
// for Meta's retries (minutes), and a chat silent for a month starts fresh. Runs at most hourly per process.
const DAY_MS = 24 * 60 * 60 * 1000;
const SEEN_KEEP_MS = 3 * DAY_MS;
const CHAT_KEEP_MS = 30 * DAY_MS;
const PRUNE_EVERY_MS = 60 * 60 * 1000;
let lastPrune = 0;

function pruneOld() {
  const now = Date.now();
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  const supabase = getSupabase();
  Promise.all([
    supabase.from("whatsapp_seen").delete().lt("created_at", new Date(now - SEEN_KEEP_MS).toISOString()),
    supabase.from("whatsapp_chats").delete().lt("updated_at", new Date(now - CHAT_KEEP_MS).toISOString()),
  ])
    .then((results) => results.forEach((r) => r.error && console.warn("[whatsapp] cleanup failed", r.error.message)))
    .catch((error) => console.warn("[whatsapp] cleanup failed", error));
  for (const [id, at] of localSeen) if (now - at > SEEN_KEEP_MS) localSeen.delete(id);
}

function fallback(reason: unknown) {
  if (!warned) {
    warned = true;
    console.warn("[whatsapp] Supabase memory unavailable, using process memory. Run supabase/add-whatsapp.sql.", reason);
  }
}

/** True the first time a WhatsApp message id is seen; Meta retries webhooks it thinks failed. */
export async function firstSighting(messageId: string) {
  if (!messageId) return false;
  pruneOld();
  try {
    const { error } = await getSupabase().from("whatsapp_seen").insert({ message_id: messageId });
    if (!error) return true;
    if (error.code === "23505") return false;
    throw error;
  } catch (error) {
    fallback(error);
    if (localSeen.has(messageId)) return false;
    localSeen.set(messageId, Date.now());
    return true;
  }
}

export async function loadChat(phone: string): Promise<Chat> {
  try {
    const { data, error } = await getSupabase().from("whatsapp_chats").select("history, draft").eq("phone", phone).maybeSingle();
    if (error) throw error;
    return { history: (data?.history as Turn[]) ?? [], draft: (data?.draft as OrderDraft | null) ?? null };
  } catch (error) {
    fallback(error);
    return local.get(phone) ?? { history: [], draft: null };
  }
}

export async function saveChat(phone: string, chat: Chat) {
  const row = { history: chat.history.slice(-HISTORY_TURNS), draft: chat.draft };
  try {
    const { error } = await getSupabase()
      .from("whatsapp_chats")
      .upsert({ phone, ...row, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (error) {
    fallback(error);
    local.set(phone, row);
  }
}
