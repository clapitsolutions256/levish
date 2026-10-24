import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!name || name.length > 80) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = getSupabase();
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (created.error) {
      const message = created.error.message.toLowerCase();
      if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: "Could not create the account." }, { status: 400 });
    }

    const signedIn = await supabase.auth.signInWithPassword({ email, password });
    if (signedIn.error || !signedIn.data.session || !signedIn.data.user) {
      return NextResponse.json(
        { message: "Account created. Sign in to continue.", user: { id: created.data.user.id, email, name } },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "Account created.",
        token: signedIn.data.session.access_token,
        user: {
          id: signedIn.data.user.id,
          email,
          name,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
