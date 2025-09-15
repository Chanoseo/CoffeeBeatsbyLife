// api>orders>route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CartItem = {
  productId: string;
  quantity: number;
  size?: string; // ✅ add size
  product: {
    price: number;
  };
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const { cartItems, seat, time, paymentProof, guestCount } = body as {
      cartItems: CartItem[];
      seat?: string | null;
      time?: string | null;
      paymentProof?: string | null;
      guestCount?: number;
    };

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Upload Base64 screenshot to Cloudinary
    let uploadedProof: string | null = null;
    if (paymentProof) {
      const uploadResponse = await cloudinary.uploader.upload(paymentProof, {
        folder: "orders/payment_proofs",
      });
      uploadedProof = uploadResponse.secure_url;
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        seatId: seat ?? null, // store seatId correctly
        time: time ? new Date(time) : null,
        paymentProof: uploadedProof,
        totalAmount,
        guest: guestCount ?? 1,
        startTime: time ? new Date(time) : new Date(), // ✅ required
        endTime: time
          ? new Date(new Date(time).getTime() + 2 * 60 * 60 * 1000)
          : new Date(), // ✅ example: +2 hrs
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size, // ✅ save size
          })),
        },
      },
      include: {
        items: true,
        seat: true, // include seat info if needed
      },
    });

    // ✅ Update the seat status to "Reserved" if a seat was selected
    if (seat) {
      await prisma.seat.update({
        where: { id: seat },
        data: { status: "Reserved" },
      });
    }

    // Remove the user's cart and all its items safely
    const userCart = await prisma.cart.findFirst({ where: { userId } });
    if (userCart) {
      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      await prisma.cart.delete({ where: { id: userCart.id } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
        seat: true, // seat object: {id, name, status}
      },
      orderBy: { createdAt: "desc" },
    });

    // Map seat object to seat name
    const mappedOrders = orders.map((order) => ({
      ...order,
      seat: order.seat?.name ?? null, // ✅ convert seat object to string
    }));

    return NextResponse.json(mappedOrders, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
