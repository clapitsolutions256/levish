import { NextResponse } from "next/server";
import { getCustomer, unauthorized } from "@/lib/customerAuth";
import { changePassword } from "@/lib/customerSignIn";

export async function PATCH(request: Request) {
  const customer = await getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!currentPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: "Enter your current password and a new password of at least 8 characters." },
        { status: 400 }
      );
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ error: "Choose a different password." }, { status: 400 });
    }

    const failed = await changePassword(customer, currentPassword, newPassword);
    if (failed) return NextResponse.json({ error: failed.error }, { status: failed.status });
    return NextResponse.json({ message: "Password updated." });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
