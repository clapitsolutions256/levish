import { NextResponse } from "next/server";
import { getCustomer, unauthorized } from "@/lib/customerAuth";
import { getSupabase } from "@/lib/supabase";


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

    const check = await getSupabase().auth.signInWithPassword({
      email: customer.email,
      password: currentPassword,
    });
    if (check.error) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const updated = await getSupabase().auth.admin.updateUserById(customer.id, {
      password: newPassword,
    });
    if (updated.error) {
      return NextResponse.json({ error: "Could not update the password." }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated." });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
