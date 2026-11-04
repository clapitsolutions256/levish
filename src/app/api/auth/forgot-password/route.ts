import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";
import { requestPasswordReset } from "@/lib/customerSignIn";

export async function POST(request: Request) {
  try {
    const email = String((await request.json()).email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    await requestPasswordReset(email, request.headers.get("origin") || SITE_URL);

    // Same answer either way, so the form doesn't reveal who has an account.
    return NextResponse.json({
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Could not send the reset link." }, { status: 500 });
  }
}
