import { NextResponse } from "next/server";
import { getCustomer, unauthorized } from "@/lib/customerAuth";
import { getSupabase } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "@/lib/customerAccounts";

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

    const supabase = getSupabase();
    const { data } = await supabase.from("profiles").select("password_hash").eq("id", customer.id).maybeSingle();
    if (!data?.password_hash || !(await verifyPassword(currentPassword, data.password_hash))) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const updated = await supabase.from("profiles").update({ password_hash: await hashPassword(newPassword) }).eq("id", customer.id);
    if (updated.error) {
      return NextResponse.json({ error: "Could not update the password." }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated." });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Could not update the password." }, { status: 500 });
  }
}
