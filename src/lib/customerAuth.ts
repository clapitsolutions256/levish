import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCustomer(request: Request): Promise<CustomerUser | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;

  return {
    id: data.user.id,
    email: data.user.email,
    name: String(data.user.user_metadata?.name ?? ""),
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
}
