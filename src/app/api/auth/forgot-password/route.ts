import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const email = String((await request.json()).email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const origin = request.headers.get("origin") || "https://www.empulse.store";
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) {
      console.error("Forgot password error:", error.message);
    }

    return NextResponse.json({
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
  }
}
