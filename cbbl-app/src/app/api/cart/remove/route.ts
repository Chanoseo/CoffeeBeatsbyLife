import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { cartItemId } = body; // 🛒 which item to remove

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ✅ Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Check item belongs to user’s cart
    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      return NextResponse.json({ error: "Item not found in your cart" }, { status: 404 });
    }

    // ✅ Remove item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
