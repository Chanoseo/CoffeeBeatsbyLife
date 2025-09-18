// api/cart/add/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, size, quantity } = body;

    // 🔑 Session check
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

    // ✅ Find product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ✅ Find or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // ✅ Check if item already exists
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        ...(product.type === "DRINK" ? { size } : {}), // match size only for drinks
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      // build data dynamically so `size` is not included for FOOD
      const itemData: Parameters<typeof prisma.cartItem.create>[0]["data"] = {
        cartId: cart.id,
        productId,
        quantity,
      };
      if (product.type === "DRINK") {
        itemData.size = size;
      }

      await prisma.cartItem.create({ data: itemData });
    }

    return NextResponse.json({
      message: "Added to cart successfully",
      items: await prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true },
      }),
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}
