import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const notification = await prisma.notification.findFirst({
      orderBy: { createdAt: "desc" }, // latest store status
    });

    if (!notification) {
      return NextResponse.json({ storeStatus: "closed" }); // default
    }

    return NextResponse.json({ storeStatus: notification.storeStatus });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ storeStatus: "closed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeStatus } = body;

    if (!storeStatus) {
      return NextResponse.json(
        { error: "storeStatus is required" },
        { status: 400 }
      );
    }

    // Delete previous notifications
    await prisma.notification.deleteMany({});

    // Create new notification
    const notification = await prisma.notification.create({
      data: { storeStatus },
    });

    // Send emails to users
    const users = await prisma.user.findMany({
      where: { role: "user", email: { not: null } },
      select: { email: true, name: true },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const statusTextMap: Record<string, string> = {
      open: "We are pleased to inform you that our store is now open. We look forward to welcoming you.",
      closed:
        "Please be informed that our store is currently closed. We apologize for any inconvenience and look forward to serving you soon.",
      busy: "Kindly note that our store has reached full capacity at the moment. We appreciate your patience and suggest visiting at a later time.",
    };

    const statusText = statusTextMap[storeStatus] || "";

    for (const user of users) {
      try {
        await transporter.sendMail({
          from: `"Coffee Beats" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `Store Status Update: ${storeStatus.toUpperCase()}`,
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
                    Store Status Update
                  </h1>
                </div>

                <!-- Body -->
                <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                  <p style="color: #555555;">Dear ${user.name || "Valued Customer"},</p>

                  <p style="color: #555555;">
                    <strong>Current Store Status:</strong> ${storeStatus.toUpperCase()}
                  </p>

                  <p style="color: #555555;">
                    ${statusText}
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
                      ${storeStatus.toUpperCase()}
                    </p>
                  </div>

                  <p style="color: #555555;">
                    Thank you for your continued support.
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
        });
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
      }
    }

    return NextResponse.json({ notification, emailedTo: users.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create notification or send emails" },
      { status: 500 }
    );
  }
}
