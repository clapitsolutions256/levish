import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashPassword, signCustomerToken } from "@/lib/customerAccounts";

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
    const { data: existing } = await supabase.from("profiles").select("id, password_hash").eq("email", email).maybeSingle();
    if (existing?.password_hash) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    // A profile moved over without a password (from the old sign-in) is claimed by signing up again.
    const saved = existing
      ? await supabase.from("profiles").update({ name, password_hash: passwordHash }).eq("id", existing.id).select("id").single()
      : await supabase.from("profiles").insert({ name, email, password_hash: passwordHash }).select("id").single();
    if (saved.error || !saved.data) {
      if (saved.error?.code === "23505") {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      throw saved.error;
    }

    const user = { id: saved.data.id as string, email, name };
    return NextResponse.json({ message: "Account created.", token: signCustomerToken(user), user }, { status: 201 });
  } catch (err) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
