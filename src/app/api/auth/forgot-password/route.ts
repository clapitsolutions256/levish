import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { SITE_URL } from "@/lib/site";
import { newResetToken } from "@/lib/customerAccounts";
import { sendPasswordReset } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const email = String((await request.json()).email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: profile } = await supabase.from("profiles").select("id, name").eq("email", email).maybeSingle();
    if (profile) {
      const reset = newResetToken();
      await supabase.from("profiles").update({ reset_token_hash: reset.hash, reset_expires_at: reset.expiresAt }).eq("id", profile.id);
      const origin = request.headers.get("origin") || SITE_URL;
      await sendPasswordReset(email, String(profile.name ?? ""), `${origin}/reset-password?token=${reset.token}`);
    }

    // Same answer either way, so the form doesn't reveal who has an account.
    return NextResponse.json({
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
  }
}
