import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";
import { suggestionPool } from "@/lib/showcase";

// The bag's "you may also like" pieces. Fetched when the bag first opens, so pages don't carry the whole catalog.
export const revalidate = 300;

export async function GET() {
  try {
    return NextResponse.json(suggestionPool(await getActiveProducts()));
  } catch (err) {
    console.error("Suggestions error:", err);
    return NextResponse.json([]);
  }
}
