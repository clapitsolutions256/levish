import { NextResponse } from "next/server";
import { getCustomer, unauthorized } from "@/lib/customerAuth";
import { getSupabase } from "@/lib/supabase";
import { toOrder, withProductImages, type OrderRow } from "@/lib/orders";

export async function GET(request: Request) {
  const customer = await getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const supabase = getSupabase();
    const email = customer.email.toLowerCase();
    const [owned, byEmail] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", customer.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*").eq("email", email).order("created_at", { ascending: false }),
    ]);
    if (owned.error) throw owned.error;
    if (byEmail.error) throw byEmail.error;

    const seen = new Set<string>();
    const rows = [...(owned.data ?? []), ...(byEmail.data ?? [])].filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    }) as OrderRow[];
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const prepared = rows.map((row) => {
      const order = toOrder(row);
      return {
        _id: order._id,
        status: order.status,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        orderItems: order.orderItems,
      };
    });
    const images = await withProductImages(prepared.flatMap((order) => order.orderItems));
    let cursor = 0;
    const orders = prepared.map((order) => {
      const orderItems = images.slice(cursor, cursor + order.orderItems.length);
      cursor += order.orderItems.length;
      return { ...order, orderItems };
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, first_name, last_name, address, apartment, city, state, postal_code, phone")
      .eq("id", customer.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        ...customer,
        name: profile?.name || customer.name,
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        address: profile?.address ?? "",
        apartment: profile?.apartment ?? "",
        city: profile?.city ?? "",
        state: profile?.state ?? "",
        postalCode: profile?.postal_code ?? "",
        phone: profile?.phone ?? "",
      },
      orders,
    });
  } catch (err) {
    console.error("Account orders error:", err);
    return NextResponse.json({ error: "Could not load your orders." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const customer = await getCustomer(request);
  if (!customer) return unauthorized();

  try {
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const address = String(body.address ?? "").trim();
    const apartment = String(body.apartment ?? "").trim();
    const city = String(body.city ?? "").trim();
    const state = String(body.state ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const hasAddress = "firstName" in body || "address" in body || "phone" in body;

    if (!hasAddress) {
      const name = String(body.name ?? "").trim();
      if (!name || name.length > 80) {
        return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
      }
      const supabase = getSupabase();
      const updated = await supabase.auth.admin.updateUserById(customer.id, {
        user_metadata: { name },
      });
      if (updated.error) throw updated.error;
      await supabase.from("profiles").update({ name }).eq("id", customer.id);
      return NextResponse.json({ user: { ...customer, name } });
    }

    if (!firstName || firstName.length > 80 || lastName.length > 80) {
      return NextResponse.json({ error: "Enter your first and last name." }, { status: 400 });
    }
    if (!address || !city || !phone) {
      return NextResponse.json({ error: "Enter your address, city, and phone." }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`.trim();
    const supabase = getSupabase();
    const updated = await supabase.auth.admin.updateUserById(customer.id, {
      user_metadata: { name },
    });
    if (updated.error) throw updated.error;

    const saved = await supabase
      .from("profiles")
      .update({
        name,
        first_name: firstName,
        last_name: lastName,
        address,
        apartment,
        city,
        state,
        postal_code: postalCode,
        phone,
      })
      .eq("id", customer.id);
    if (saved.error) throw saved.error;

    return NextResponse.json({
      user: {
        ...customer,
        name,
        firstName,
        lastName,
        address,
        apartment,
        city,
        state,
        postalCode,
        phone,
      },
    });
  } catch (err) {
    console.error("Update name error:", err);
    return NextResponse.json({ error: "Could not update your name." }, { status: 500 });
  }
}
