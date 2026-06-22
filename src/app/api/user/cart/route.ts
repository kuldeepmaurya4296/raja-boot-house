import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/lib/models/Cart";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: session.user.id }).lean();

    return NextResponse.json(cart || { items: [] });
  } catch (error: any) {
    console.error("Failed to fetch user cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { lines } = body;

    if (!Array.isArray(lines)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const items = lines.map((l: any) => ({
      productId: l.productId,
      name: l.name,
      price: l.price,
      image: l.image,
      size: l.size,
      color: l.color,
      quantity: l.quantity,
      slug: l.slug,
    }));

    // Find and update or create cart. Reset emailSent flag.
    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      {
        items,
        emailSent: false,
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    console.error("Failed to sync cart:", error);
    return NextResponse.json({ error: error.message || "Failed to sync cart" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
