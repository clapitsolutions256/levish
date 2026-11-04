import { NextResponse } from "next/server";
import { signIn } from "@/lib/customerSignIn";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
    }

    const result = await signIn(email, password);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Could not sign in." }, { status: 500 });
  }
}
