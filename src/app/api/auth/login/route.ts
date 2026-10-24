import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const name = String(data.user.user_metadata?.name ?? "");
    return NextResponse.json({
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email ?? email, name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
