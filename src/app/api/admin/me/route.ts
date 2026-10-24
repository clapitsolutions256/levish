import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const admin = verifyAdmin(request);
    return NextResponse.json({ email: admin.email, name: "Admin", role: admin.role });
  } catch {
    return unauthorizedResponse("Invalid or expired token");
  }
}
