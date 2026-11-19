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

function fallback(reason: unknown) {
  if (!warned) {
    warned = true;
    console.warn("[whatsapp] Supabase memory unavailable, using process memory. Run supabase/add-whatsapp.sql.", reason);
  }
}

/** True the first time a WhatsApp message id is seen; Meta retries webhooks it thinks failed. */
export async function firstSighting(messageId: string) {
  if (!messageId) return false;
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
