import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");
    if (!token) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    const updated = await supabase.auth.admin.updateUserById(data.user.id, { password });
    if (updated.error) {
      return NextResponse.json({ error: "Could not update the password." }, { status: 400 });
    }

    const signedIn = await supabase.auth.signInWithPassword({
      email: data.user.email,
      password,
    });
    if (signedIn.error || !signedIn.data.session) {
      return NextResponse.json({ message: "Password updated. Sign in to continue." });
    }

    return NextResponse.json({
      message: "Password updated.",
      token: signedIn.data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: String(data.user.user_metadata?.name ?? ""),
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
