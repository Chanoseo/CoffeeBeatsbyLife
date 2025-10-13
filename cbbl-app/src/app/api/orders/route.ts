// api>orders>route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

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

    let endTime: Date;
    if (time) {
      // Default 2-hour slot
      endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      // Cap endTime at 10 PM
      const closingTime = new Date(startTime);
      closingTime.setHours(22, 0, 0, 0); // 10:00 PM
      if (endTime > closingTime) {
        endTime = closingTime;
      }
    } else {
      endTime = new Date();
    }

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
        items: { include: { product: true } },
        seat: true, // include seat info if needed
        user: true,
      },
    });

    // ✅ Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail", // or use SMTP config
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Format date and time
      const dateFormatted = new Date(order.startTime).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );
      const startFormatted = new Date(order.startTime)
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");
      const endFormatted = new Date(order.endTime)
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "");

      // Generate product list
      const productsHtml = order.items
        .map(
          (item) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; color:#333;">
                ${item.product.name} (${item.size || "Regular"})
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:center; color:#333;">
                ${item.quantity}
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align:right; color:#333;">
                ₱${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("");

      const mailOptions = {
        from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
        to: order.user.email,
        subject: `Order Confirmation - ${order.id}`,
        html: `
          <div style="font-family: 'Arial', sans-serif; background-color: rgba(60, 96, 76, 0.08); padding: 30px;">
            <div style="
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.08);
              border: 1px solid #e0e0e0;
              overflow: hidden;
            ">
              <!-- Header -->
              <div style="
                background-color: rgb(60, 96, 76);
                text-align: center;
                padding: 30px 20px;
              ">
                <h1 style="
                  color: #ffffff;
                  font-size: 28px;
                  font-weight: 700;
                  margin: 0;
                  line-height: 1.2;
                ">
                  Order Confirmed
                </h1>
              </div>

              <!-- Body -->
              <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                <p style="color: #555555;">Dear ${
                  order.user.name || "Valued Customer"
                },</p>

                <p style="color: #555555;">
                  Thank you for your order at <strong>Coffee Beats By Life</strong>. Your order has been placed successfully. Below are your details:
                </p>

                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                  <strong>Order ID:</strong> ${order.id}<br/>
                  <strong>Seat:</strong> ${order.seat?.name || "N/A"}<br/>
                  <strong>Date:</strong> ${dateFormatted}<br/>
                  <strong>Start Time:</strong> ${startFormatted}<br/>
                  <strong>End Time:</strong> ${endFormatted}<br/>
                  <strong>Seat Cost:</strong> ₱${seatCost.toFixed(2)}<br/>
                  <strong>Total Amount:</strong> ₱${order.totalAmount.toFixed(
                    2
                  )}
                </p>

                <h3 style="color:#3c604c; margin-top: 30px;">Ordered Items</h3>
                <table style="width:100%; border-collapse: collapse; font-size: 15px; margin-top:10px;">
                  <thead>
                    <tr style="background-color:#f1f1f1; text-align:left;">
                      <th style="padding:8px; border-bottom:1px solid #ddd;">Product</th>
                      <th style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">Qty</th>
                      <th style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productsHtml}
                  </tbody>
                </table>

                <p style="color: #555; margin-top: 25px;">
                  We look forward to serving you! ☕
                </p>
                <p style="color: #555;">
                  Sincerely,<br/>
                  <strong>Coffee Beats By Life Team</strong>
                </p>

                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 35px 0;">

                <p style="font-size: 12px; color: #999999; text-align: center;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

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
        seat: true,
        feedbacks: { include: { user: true } },
      },
      orderBy: { createdAt: "asc" }, // oldest first
    });

    // Add persistent displayId based on DB order
    const mappedOrders = orders.map((order, index) => ({
      ...order,
      seat: order.seat?.name ?? null,
      displayId: `ORD${(index + 1).toString().padStart(3, "0")}`, // now sequential
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
