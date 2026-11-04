import type { Order } from "@/store/ordersApi";
import { assets } from "@/data/assets";
import { contact } from "@/data/contact";

// An A4 page with the label on its top half (210 × 148.5 mm) and a cut line
// below it, so it prints at the right size on any office printer.
const W = 210;
const H = 297 / 2;
const M = 10;
// Ship-to on the left, items on the right.
const COL = 118;
const GAP = 8;

async function logoDataUrl() {
  try {
    const blob = await (await fetch(assets.logo)).blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function money(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

export async function downloadShippingLabel(order: Order) {
  const [{ jsPDF }, logo] = await Promise.all([import("jspdf"), logoDataUrl()]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const a = order.deliveryAddress;
  const orderNo = order._id.slice(-6).toUpperCase();
  const cod = (order.paymentMethod ?? "cod") === "cod";
  let y = M;

  // Header: logo, order number and date.
  if (logo) doc.addImage(logo, "PNG", M, y, 48, 48 * (392 / 2045));
  else doc.setFont("helvetica", "bold").setFontSize(20).text("EMPULSE", M, y + 7);
  doc.setFont("helvetica", "bold").setFontSize(14).text(`Order #${orderNo}`, W - M, y + 4, { align: "right" });
  doc
    .setFont("helvetica", "normal")
    .setFontSize(10)
    .text(new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }), W - M, y + 9.5, {
      align: "right",
    });
  y += 15;

  // Payment box: what the rider collects.
  doc.setLineWidth(0.7).rect(M, y, W - 2 * M, 16);
  doc.setFont("helvetica", "bold").setFontSize(12).text(cod ? "CASH ON DELIVERY" : "PREPAID (CARD)", M + 4, y + 7);
  doc.setFont("helvetica", "normal").setFontSize(10).text(cod ? "Collect from customer" : "Do not collect cash", M + 4, y + 12.5);
  doc.setFont("helvetica", "bold").setFontSize(22).text(cod ? money(order.total) : "Rs. 0", W - M - 4, y + 11, { align: "right" });
  y += 23;
  const top = y;

  // Ship to (left column).
  doc.setFont("helvetica", "bold").setFontSize(9).text("SHIP TO", M, y);
  y += 8;
  doc.setFontSize(18).text(doc.splitTextToSize(`${a.firstName} ${a.lastName}`.trim(), COL - M)[0], M, y);
  y += 7.5;
  doc.setFont("helvetica", "normal").setFontSize(12);
  const street = [a.address, a.apartment].filter(Boolean).join(", ");
  const lines = (doc.splitTextToSize(street, COL - M) as string[]).slice(0, 4);
  doc.text(lines, M, y);
  y += lines.length * 5.2 + 2.5;
  const city = [a.city, a.state, a.postalCode].filter(Boolean).join(", ");
  doc.setFont("helvetica", "bold").setFontSize(16).text(city.toUpperCase(), M, y);
  y += 9;
  doc.setFontSize(17).text(`Phone: ${a.phone}`, M, y);

  // Items (right column), so the parcel can be checked before sealing.
  const x = COL + GAP;
  const width = W - M - x;
  const footerTop = H - M - 13;
  doc.setLineWidth(0.2).line(COL + GAP / 2, top - 4, COL + GAP / 2, footerTop - 3);
  let iy = top;
  const count = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  doc.setFont("helvetica", "bold").setFontSize(9).text(`ITEMS (${count})`, x, iy);
  iy += 6;
  doc.setFont("helvetica", "normal").setFontSize(9.5);
  for (const [index, item] of order.orderItems.entries()) {
    const detail = [item.variant, item.size && `Size ${item.size}`].filter(Boolean).join(" · ");
    const text = doc.splitTextToSize(`${item.quantity} × ${item.name}${detail ? ` (${detail})` : ""}`, width) as string[];
    if (iy + text.length * 4.2 > footerTop - 6) {
      doc.text(`+ ${order.orderItems.length - index} more item(s)`, x, iy);
      break;
    }
    doc.text(text, x, iy);
    iy += text.length * 4.2 + 1.5;
  }

  // From: where the courier returns it.
  y = footerTop;
  doc.setLineWidth(0.2).line(M, y, W - M, y);
  y += 5.5;
  doc.setFont("helvetica", "bold").setFontSize(9).text("FROM", M, y);
  doc.setFont("helvetica", "normal").text(`Levish · levish.store · WhatsApp ${contact.whatsapp}`, M + 13, y);
  y += 5;
  doc.setFontSize(8.5).text("First check then pay. If undelivered, please return to sender. Thank you for shopping with Empulse!", M, y);

  // Cut line across the middle of the page.
  doc.setLineDashPattern([2, 2], 0).setLineWidth(0.3).setDrawColor(150).line(0, H, W, H);
  doc.setLineDashPattern([], 0).setFontSize(7).setTextColor(150).text("cut here", W - M, H - 1.5, { align: "right" });

  doc.save(`empulse-order-${orderNo}-${a.firstName || "label"}.pdf`.replace(/\s+/g, "-"));
}
