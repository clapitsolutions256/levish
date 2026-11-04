import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/customerSignIn";

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

    const result = await resetPassword(token, password);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ message: "Password updated.", ...result });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
