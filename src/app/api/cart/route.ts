import { NextResponse } from "next/server";
import {
  addCartItem,
  cartResponse,
  clearCartItems,
  getCartItems,
  removeCartItem,
  resolveCartOwner,
  updateCartItem,
} from "@/lib/cart";

function cleanLabel(value: unknown) {
  return String(value ?? "").trim().slice(0, 40);
}

export async function GET(request: Request) {
  try {
    const owner = await resolveCartOwner(request);
    const items = await getCartItems(owner.userId, owner.guestToken);
    return cartResponse(items, owner.userId ? null : owner.guestToken);
  } catch {
    return NextResponse.json({ error: "Could not load your cart." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const productId = String(body?.productId ?? "").trim();
    if (!productId) {
      return NextResponse.json({ error: "Choose a product to add." }, { status: 400 });
    }
    const owner = await resolveCartOwner(request);
    const result = await addCartItem(
      owner.userId,
      owner.guestToken,
      productId,
      Number(body?.quantity) || 1,
      cleanLabel(body?.size),
      cleanLabel(body?.color)
    );
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return cartResponse(result.items, result.guestToken);
  } catch {
    return NextResponse.json({ error: "Could not add that item." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const productId = String(body?.productId ?? "").trim();
    if (!productId) {
      return NextResponse.json({ error: "Choose a product to update." }, { status: 400 });
    }
    const owner = await resolveCartOwner(request);
    const result = await updateCartItem(
      owner.userId,
      owner.guestToken,
      productId,
      Number(body?.quantity),
      cleanLabel(body?.size),
      cleanLabel(body?.color)
    );
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return cartResponse(result.items, result.guestToken);
  } catch {
    return NextResponse.json({ error: "Could not update your cart." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const productId = String(body?.productId ?? "").trim();
    const owner = await resolveCartOwner(request);
    if (!productId) {
      await clearCartItems(owner.userId, owner.guestToken);
      return cartResponse([], owner.userId ? null : owner.guestToken);
    }
    const items = await removeCartItem(
      owner.userId,
      owner.guestToken,
      productId,
      cleanLabel(body?.size),
      cleanLabel(body?.color)
    );
    return cartResponse(items, owner.userId ? null : owner.guestToken);
  } catch {
    return NextResponse.json({ error: "Could not update your cart." }, { status: 500 });
  }
}
