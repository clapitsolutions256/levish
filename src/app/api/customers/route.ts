import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

type Row = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  total: number;
  created_at: string;
};

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);
  } catch {
    return unauthorizedResponse();
  }

  try {
    const search = new URL(request.url).searchParams.get("search")?.trim().toLowerCase() ?? "";
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("email, first_name, last_name, phone, city, total, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const grouped = new Map<string, {
      _id: string;
      firstName: string;
      lastName: string;
      phone: string;
      city: string;
      totalOrders: number;
      totalSpent: number;
      lastOrder: string;
    }>();

    for (const row of (data ?? []) as Row[]) {
      const existing = grouped.get(row.email);
      if (!existing) {
        grouped.set(row.email, {
          _id: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          phone: row.phone,
          city: row.city,
          totalOrders: 1,
          totalSpent: Number(row.total) || 0,
          lastOrder: row.created_at,
        });
      } else {
        existing.totalOrders += 1;
        existing.totalSpent += Number(row.total) || 0;
      }
    }

    let customers = [...grouped.values()];
    if (search) {
      customers = customers.filter((customer) =>
        [customer._id, customer.firstName, customer.lastName, customer.phone]
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    }
    return NextResponse.json(customers);
  } catch (err) {
    console.error("Customers error:", err);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
