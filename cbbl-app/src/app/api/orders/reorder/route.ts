// api/orders/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Get past order items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Get or create user's cart
    let cart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }

    // Add or update items like add-to-cart API
    for (const item of order.items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: item.productId,
          size: item.size ?? "small",
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: item.quantity } },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            size: item.size ?? "small",
            quantity: item.quantity,
          },
        });
      }
    }

    return NextResponse.json({ message: "Order added to cart successfully" }, { status: 200 });
  } catch (err) {
    console.error("Reorder Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
