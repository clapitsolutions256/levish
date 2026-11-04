import { SITE_URL } from "@/lib/site";
import { assets } from "@/data/assets";

// Emails go through Resend (resend.com). Set RESEND_API_KEY to turn them on.
// ORDER_EMAIL_FROM must use a domain verified in Resend, e.g. "Levish <orders@levish.store>".
const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "Levish <orders@levish.store>";
// Customer replies land in the Levish inbox.
const DEFAULT_REPLY_TO = "itslevishstore@gmail.com";

const INK = "#0b0b0b";
const SAGE = "#a6cdab";
const SAGE_TINT = "#e4efe5";
const MUTED = "#5d655f";
const PAPER = "#f5f7f4";

export type OrderEmail = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  phone: string;
  items: { name: string; variant?: string; size?: string; price: number; quantity: number; image?: string }[];
  subtotal: number;
  shipping: string;
  total: number;
  discount?: number;
  promoCode?: string;
  paymentMethod: string;
};

function escape(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function money(value: number) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function absolute(url = "") {
  if (!url) return "";
  return url.startsWith("http") ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function orderNumber(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// Shared frame: logo on top, sage rule, white card on paper.
function frame(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${PAPER};font-family:Poppins,Segoe UI,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${PAPER};padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(11,11,11,0.06)">
          <tr><td style="height:6px;background:${SAGE}"></td></tr>
          <tr><td style="padding:32px 32px 0;text-align:center">
            <img src="${absolute(assets.logo)}" width="140" alt="Levish" style="display:inline-block;width:140px;height:auto">
          </td></tr>
          ${content}
          <tr><td style="padding:24px 32px 32px;text-align:center;font-size:12px;line-height:1.7;color:${MUTED}">
            Nationwide delivery · 100% original · First check then pay<br>
            Questions? Just reply to this email.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string) {
  return `<a href="${escape(href)}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${INK};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none">${escape(label)}</a>`;
}

function confirmationHtml(order: OrderEmail) {
  const cod = order.paymentMethod !== "card";
  const rows = order.items
    .map((item) => {
      const details = [item.variant, item.size ? `Size ${item.size}` : "", `Qty ${item.quantity}`].filter(Boolean).join(" · ");
      const image = absolute(item.image);
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eef1ed;width:72px;vertical-align:top">
            ${image ? `<img src="${escape(image)}" width="64" height="80" alt="" style="display:block;width:64px;height:80px;object-fit:cover;border-radius:10px;background:${SAGE_TINT}">` : ""}
          </td>
          <td style="padding:12px 12px;border-bottom:1px solid #eef1ed;vertical-align:top">
            <div style="font-size:14px;font-weight:600;color:${INK}">${escape(item.name)}</div>
            <div style="font-size:12px;color:${MUTED};margin-top:4px">${escape(details)}</div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #eef1ed;text-align:right;vertical-align:top;font-size:14px;font-weight:600;color:${INK};white-space:nowrap">
            ${money(item.price * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");
  const address = [order.address, order.apartment ?? "", order.city].filter(Boolean).map(escape).join("<br>");

  return frame(`
          <tr><td style="padding:24px 32px 8px;text-align:center">
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4f7d57">Order confirmed</p>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:${INK}">Thank you, ${escape(order.firstName)}!</h1>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:${MUTED}">
              We have received your order and are getting it ready.<br>We will call you on ${escape(order.phone)} to confirm it.
            </p>
            <p style="display:inline-block;margin:20px 0 0;padding:8px 16px;border-radius:999px;background:${SAGE_TINT};font-size:13px;font-weight:600;color:${INK}">
              Order #${orderNumber(order.id)}
            </p>
          </td></tr>
          <tr><td style="padding:16px 32px 0">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;font-size:14px;color:${MUTED}">
              <tr><td style="padding:4px 0">Subtotal</td><td style="padding:4px 0;text-align:right">${money(order.subtotal)}</td></tr>
              ${order.discount ? `<tr><td style="padding:4px 0">Discount${order.promoCode ? ` (${escape(order.promoCode)})` : ""}</td><td style="padding:4px 0;text-align:right;color:#4f7d57">- ${money(order.discount)}</td></tr>` : ""}
              <tr><td style="padding:4px 0">Shipping</td><td style="padding:4px 0;text-align:right">${escape(order.shipping)}</td></tr>
              <tr><td style="padding:10px 0 0;font-size:16px;font-weight:700;color:${INK}">Total</td><td style="padding:10px 0 0;text-align:right;font-size:16px;font-weight:700;color:${INK}">${money(order.total)}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:24px 32px 0">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${PAPER};border-radius:14px">
              <tr>
                <td style="padding:16px;vertical-align:top;width:50%">
                  <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Delivering to</div>
                  <div style="margin-top:6px;font-size:13px;line-height:1.6;color:${INK}">${escape(`${order.firstName} ${order.lastName}`)}<br>${address}</div>
                </td>
                <td style="padding:16px;vertical-align:top;width:50%">
                  <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Payment</div>
                  <div style="margin-top:6px;font-size:13px;line-height:1.6;color:${INK}">${cod ? "Cash on delivery<br>First check, then pay" : "Card"}</div>
                </td>
              </tr>
            </table>
          </td></tr>
          <tr><td style="padding:28px 32px 0;text-align:center">${button(`${SITE_URL}/order/${order.id}`, "View your order")}</td></tr>`);
}

function resetHtml(name: string, link: string) {
  return frame(`
          <tr><td style="padding:24px 32px 8px;text-align:center">
            <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4f7d57">Password reset</p>
            <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:${INK}">Hi${name ? ` ${escape(name)}` : ""}, choose a new password</h1>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:${MUTED}">
              Tap the button to set a new password for your Levish account.<br>The link works for one hour. If you didn't ask for this, you can ignore this email.
            </p>
          </td></tr>
          <tr><td style="padding:24px 32px 0;text-align:center">${button(link, "Set a new password")}</td></tr>`);
}

// Never throws: a failed email must not fail the order or the request that sent it.
async function send(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || DEFAULT_FROM,
        to: [to],
        reply_to: process.env.ORDER_EMAIL_REPLY_TO || DEFAULT_REPLY_TO,
        subject,
        html,
      }),
    });
    if (!response.ok) console.error("Email failed:", response.status, await response.text());
    return response.ok;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}

/** The "thank you" email after checkout. */
export function sendOrderConfirmation(order: OrderEmail) {
  return send(order.email, `Thank you for your order #${orderNumber(order.id)}`, confirmationHtml(order));
}

/** A link to choose a new password. */
export function sendPasswordReset(email: string, name: string, link: string) {
  return send(email, "Reset your Levish password", resetHtml(name, link));
}
