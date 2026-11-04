import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Levish shares a Supabase project with Empulse; its tables live in their own schema and
// its photos in their own bucket, so the two stores never read or write each other's data.
// The Supabase project Levish shares with Empulse. There, Levish's schema and bucket must be set
// explicitly (levish / levish-images), so a missing setting can never point Levish at Empulse's
// "public" tables or "product-images" photos. Levish's own old project uses the defaults.
const SHARED_PROJECT = "fvpukvbdvtfqlnvlijqa.supabase.co";
const shared = (url ?? "").includes(SHARED_PROJECT);
export const DB_SCHEMA = process.env.SUPABASE_SCHEMA || (shared ? "" : "public");
export const STORAGE_BUCKET = process.env.SUPABASE_BUCKET || (shared ? "" : "product-images");

export function getSupabase() {
  if (!url || !serviceKey || !DB_SCHEMA || !STORAGE_BUCKET) {
    throw new Error(
      shared
        ? "Set SUPABASE_SCHEMA=levish and SUPABASE_BUCKET=levish-images: this Supabase project is shared with Empulse."
        : "Supabase environment variables are not set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  return createClient(url, serviceKey, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false, flowType: "implicit" },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
