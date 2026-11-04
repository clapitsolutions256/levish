import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "levish-admin-secret-2026";

export interface AdminPayload {
  email: string;
  role: string;
}

export function verifyAdmin(request: Request): AdminPayload {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET, { audience: "levish-admin" }) as AdminPayload;
  // Only tokens issued by the admin login (role "admin") open admin routes.
  if (decoded?.role !== "admin") throw new Error("Unauthorized");
  return decoded;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
