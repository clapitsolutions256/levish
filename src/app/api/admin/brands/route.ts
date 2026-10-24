import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { listSavedBrands, saveBrand } from "@/lib/catalog";

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    return NextResponse.json(await listSavedBrands());
  } catch (err) {
    console.error("Admin brands error:", err);
    return NextResponse.json({ error: "Could not load brands." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim().slice(0, 60);
    if (!name) return NextResponse.json({ error: "Enter a brand name." }, { status: 400 });
    await saveBrand(name);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Create brand error:", err);
    return NextResponse.json({ error: "Could not save the brand." }, { status: 500 });
  }
}
