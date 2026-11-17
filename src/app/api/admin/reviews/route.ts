import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { listStoredReviews } from "@/lib/reviews";

export async function GET(request: Request) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    return NextResponse.json(await listStoredReviews());
  } catch (err) {
    console.error("Reviews error:", err);
    return NextResponse.json({ error: "Could not load reviews. Has the reviews table been created in Supabase?" }, { status: 500 });
  }
}
