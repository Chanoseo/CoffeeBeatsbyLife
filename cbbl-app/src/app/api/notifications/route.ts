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
            <p>Dear ${user.name || "Valued Customer"},</p>
            <p><strong>Current Store Status:</strong> ${storeStatus.toUpperCase()}</p>
            <p>${statusText}</p>
            <p>Thank you for your continued support.</p>
            <p>Best regards,<br/>Coffee Beats By Life Team</p>
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
