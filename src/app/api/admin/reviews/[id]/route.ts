import { NextResponse } from "next/server";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { deleteReview, setReviewStatus, type ReviewStatus } from "@/lib/reviews";

type Context = { params: Promise<{ id: string }> };

const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

/** Approves or rejects a review. Approved reviews show on the site straight away. */
export async function PATCH(request: Request, context: Context) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    const { status } = (await request.json()) as { status?: ReviewStatus };
    if (!status || !STATUSES.includes(status)) return NextResponse.json({ error: "Unknown status." }, { status: 400 });
    await setReviewStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update review error:", err);
    return NextResponse.json({ error: "Could not update the review." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { id } = await context.params;
    await deleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete review error:", err);
    return NextResponse.json({ error: "Could not delete the review." }, { status: 500 });
  }
}
