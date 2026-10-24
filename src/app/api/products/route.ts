import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";

export async function GET() {
  try {
    const products = await getActiveProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error("Products error:", err);
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}
