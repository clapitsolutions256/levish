import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { signCustomerToken, verifyPassword } from "@/lib/customerAccounts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const { data } = await getSupabase().from("profiles").select("id, name, email, password_hash").eq("email", email).maybeSingle();
    if (!data?.password_hash || !(await verifyPassword(password, data.password_hash))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const user = { id: data.id as string, email: data.email as string, name: String(data.name ?? "") };
    return NextResponse.json({ token: signCustomerToken(user), user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
