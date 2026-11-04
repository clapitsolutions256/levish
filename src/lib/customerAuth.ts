import { NextResponse } from "next/server";
import { customerFromToken } from "@/lib/customerSignIn";

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCustomer(request: Request): Promise<CustomerUser | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  return customerFromToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
}
