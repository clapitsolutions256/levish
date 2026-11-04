import { NextResponse } from "next/server";
import { signUp } from "@/lib/customerSignIn";

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

    const result = await signUp(name, email, password);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ message: "Account created.", ...result }, { status: 201 });
  } catch (err) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
