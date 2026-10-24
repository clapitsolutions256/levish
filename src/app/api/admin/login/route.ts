import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "levish-admin-secret-2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@levish.store";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    return NextResponse.json({ token, admin: { email, name: "Admin" } });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
