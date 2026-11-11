import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

const SUBJECTS: Record<string, string> = {
  order: "Order / Shipping",
  return: "Returns / Exchanges",
  product: "Product question",
  other: "Other",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 100);
  const email = String(body?.email ?? "").trim().slice(0, 200);
  const message = String(body?.message ?? "").trim().slice(0, 5000);
  // Bots fill the hidden field; people never see it. Pretend it worked.
  if (body?.website) return NextResponse.json({ ok: true });
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return NextResponse.json({ error: "Please add your name, a valid email and a message." }, { status: 400 });
  }
  const sent = await sendContactMessage({ name, email, subject: SUBJECTS[body?.subject] ?? SUBJECTS.other, message });
  if (!sent) {
    return NextResponse.json({ error: "We couldn't send your message. Please message us on WhatsApp instead." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
