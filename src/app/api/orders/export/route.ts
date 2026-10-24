import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/orders";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const orders = await listOrders({ status: searchParams.get("status") });

    const header = "Order ID,Customer Name,Email,Phone,Address,City,State,Postal Code,Items,Subtotal,Shipping,Total,Status,Date\n";
    const rows = orders
      .map((o) => {
        const items = (o.orderItems || []).map((i) => `${i.name} x${i.quantity}`).join(" | ");
        const d = new Date(o.createdAt).toISOString().split("T")[0];
        return [
          o._id,
          `${o.deliveryAddress.firstName} ${o.deliveryAddress.lastName}`,
          o.contact.email,
          o.deliveryAddress.phone,
          `"${o.deliveryAddress.address}"`,
          o.deliveryAddress.city,
          o.deliveryAddress.state || "",
          o.deliveryAddress.postalCode || "",
          `"${items}"`,
          o.subtotal, o.shipping, o.total, o.status, d,
        ].join(",");
      })
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=orders.csv",
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Failed to export orders." }, { status: 500 });
  }
}
