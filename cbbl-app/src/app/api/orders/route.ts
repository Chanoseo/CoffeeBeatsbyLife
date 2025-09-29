// api>orders>route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CartItem = {
  productId: string;
  quantity: number;
  size?: string;
  product: {
    price: number;
    mediumPrice?: number; // optional
    largePrice?: number; // optional
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
    let seatCost = 0;
    if (time) {
      const start = new Date(time);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      seatCost = hours * 10; // ₱10 per hour
    }

    const totalAmount =
      cartItems.reduce((acc, item) => {
        let itemPrice = item.product.price;

        if (item.size) {
          if (item.size === "medium" && item.product.mediumPrice != null) {
            itemPrice += item.product.mediumPrice;
          } else if (item.size === "large" && item.product.largePrice != null) {
            itemPrice += item.product.largePrice;
          }
        }

        return acc + itemPrice * item.quantity;
      }, 0) + seatCost; // ✅ add seat cost here

    // Define start & end times
    const startTime = time ? new Date(time) : new Date();
    const endTime = time
      ? new Date(new Date(time).getTime() + 2 * 60 * 60 * 1000) // +2 hrs
      : new Date();

    // ✅ Check if seat is already reserved in the given timeframe (allow selecting at end)
    if (seat) {
      const overlapping = await prisma.order.findFirst({
        where: {
          seatId: seat,
          status: { in: ["Pending", "Confirmed"] },
          // existing start < new end AND existing end > new start
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      if (overlapping) {
        const existingStart = new Date(overlapping.startTime).getTime();
        const existingEnd = new Date(overlapping.endTime).getTime();
        const newStart = startTime.getTime();
        const newEnd = endTime.getTime();

        // Allow selecting exactly at the end of existing booking
        if (!(newStart >= existingEnd || newEnd <= existingStart)) {
          return NextResponse.json(
            { error: "Seat already reserved during this time" },
            { status: 400 }
          );
        }
      }
    }

    // ✅ Create order
    const order = await prisma.order.create({
      data: {
        userId,
        seatId: seat ?? null, // store seatId correctly
        time: time ? new Date(time) : null,
        paymentProof: uploadedProof,
        totalAmount,
        guest: guestCount ?? 1,
        startTime,
        endTime,
        items: {
          create: cartItems.map((item) => {
            let finalPrice = item.product.price;
            if (item.size === "medium" && item.product.mediumPrice != null) {
              finalPrice += item.product.mediumPrice;
            } else if (
              item.size === "large" &&
              item.product.largePrice != null
            ) {
              finalPrice += item.product.largePrice;
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: finalPrice, // store final price including size
              size: item.size,
            };
          }),
        },
      },
      include: {
        items: true,
        seat: true, // include seat info if needed
      },
    });

    // ✅ Clean up cart
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
