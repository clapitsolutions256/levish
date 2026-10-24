import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabase() {
  if (!url || !serviceKey) {
    throw new Error("Supabase environment variables are not set.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, flowType: "implicit" },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
