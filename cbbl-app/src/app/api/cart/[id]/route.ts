// api/cart/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id: cartItemId } = context.params;

    if (!cartItemId) {
      return NextResponse.json({ error: "Missing cartItemId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const cart = await prisma.cart.findFirst({ where: { userId: user.id } });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // ✅ Use actual cart item ID directly
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
