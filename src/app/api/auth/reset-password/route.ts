import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashPassword, hashResetToken, signCustomerToken } from "@/lib/customerAccounts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    const invalid = NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    if (!token) return invalid;
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, email, reset_expires_at")
      .eq("reset_token_hash", hashResetToken(token))
      .maybeSingle();
    if (!profile || !profile.reset_expires_at || new Date(profile.reset_expires_at).getTime() < Date.now()) return invalid;

    const updated = await supabase
      .from("profiles")
      .update({ password_hash: await hashPassword(password), reset_token_hash: null, reset_expires_at: null })
      .eq("id", profile.id);
    if (updated.error) {
      return NextResponse.json({ error: "Could not update the password." }, { status: 400 });
    }

    const user = { id: profile.id as string, email: profile.email as string, name: String(profile.name ?? "") };
    return NextResponse.json({ message: "Password updated.", token: signCustomerToken(user), user });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
