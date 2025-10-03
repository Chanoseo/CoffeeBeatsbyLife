// api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// Configure your SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ✅ GET /api/orders/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await first

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        seat: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/orders/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, endTime } = body;

    if (!status && !endTime) {
      return NextResponse.json(
        { error: "Status or endTime is required" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
      include: { user: true },
    });

    // ✅ Send formal email if status changed
    if (status && updatedOrder.user?.email) {
      try {
        const mailOptions = {
          from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
          to: updatedOrder.user.email,
          subject: `Order #${updatedOrder.id} Status Notification`,
          text: `Dear ${
            updatedOrder.user.name || "Valued Customer"
          },\n\nWe would like to inform you that the status of your order (Order ID: ${
            updatedOrder.id
          }) has been updated to: ${status}.\n\nWe appreciate your patronage and thank you for choosing our services.\n\nSincerely,\nCoffee Beats By Life Team`,
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
                    Order Status Update
                  </h1>
                </div>

                <!-- Body -->
                <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                  <p style="color: #555555;">Dear ${
                    updatedOrder.user.name || "Valued Customer"
                  },</p>

                  <p style="color: #555555;">
                    We wish to inform you that the status of your order 
                    <strong>#${updatedOrder.id}</strong> is now:
                  </p>

                  <div style="text-align: center; margin: 25px 0;">
                    <p style="
                      background-color: rgb(60, 96, 76);
                      color: #ffffff;
                      font-weight: 700;
                      font-size: 20px;
                      padding: 16px 32px;
                      border-radius: 12px;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    ">
                      ${status}
                    </p>
                  </div>

                  <p style="color: #555555;">
                    Thank you for choosing our services. We truly appreciate your patronage and look forward to serving you again.
                  </p>

                  <p style="color: #555555;">Sincerely,<br><strong>Coffee Beats By Life Team</strong></p>

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
        console.log(
          `Formal status update email sent to ${updatedOrder.user.email}`
        );
      } catch (emailError: unknown) {
        if (emailError instanceof Error) {
          console.error(
            "Failed to send formal status update email:",
            emailError.message
          );
        } else {
          console.error("Unknown error sending formal email");
        }
      }
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("Update order error:", error.message);
    else console.error("Unknown update order error");

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/orders/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get order + user before deleting
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete items first, then the order
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.order.delete({
      where: { id },
    });

    // ✅ Send cancellation email
    if (existingOrder.user?.email) {
      try {
        const mailOptions = {
          from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
          to: existingOrder.user.email,
          subject: `Order #${existingOrder.id} Cancelled`,
          text: `Dear ${
            existingOrder.user.name || "Valued Customer"
          },\n\nWe regret to inform you that your order (Order ID: ${
            existingOrder.id
          }) has been cancelled.\n\nIf you have any questions, please contact us directly.\n\nSincerely,\nCoffee Beats By Life Team`,
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
                  background-color: #b71c1c;
                  text-align: center;
                  padding: 30px 20px;
                ">
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; line-height: 1.2;">
                    Order Cancelled
                  </h1>
                </div>

                <!-- Body -->
                <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                  <p style="color: #555555;">Dear ${
                    existingOrder.user.name || "Valued Customer"
                  },</p>

                  <p style="color: #555555;">
                    We regret to inform you that your order 
                    <strong>#${existingOrder.id}</strong> has been cancelled.
                  </p>

                  <div style="text-align: center; margin: 25px 0;">
                    <p style="
                      background-color: #b71c1c;
                      color: #ffffff;
                      font-weight: 700;
                      font-size: 20px;
                      padding: 16px 32px;
                      border-radius: 12px;
                      display: inline-block;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    ">
                      Cancelled
                    </p>
                  </div>

                  <p style="color: #555555;">
                    If you have any questions or concerns regarding this cancellation, please reach out to us directly.
                  </p>

                  <p style="color: #555555;">Sincerely,<br><strong>Coffee Beats By Life Team</strong></p>

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
        console.log(
          `Cancellation email sent to ${existingOrder.user.email}`
        );
      } catch (emailError: unknown) {
        if (emailError instanceof Error) {
          console.error(
            "Failed to send cancellation email:",
            emailError.message
          );
        } else {
          console.error("Unknown error sending cancellation email");
        }
      }
    }

    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
