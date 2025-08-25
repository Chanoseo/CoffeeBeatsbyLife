import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma"; // make sure you have prisma client

export async function POST(req: Request) {
  try {
    const { to, message, messageId } = await req.json();

    if (!to || !message || !messageId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    console.log("Sending email to:", to);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Coffee Beats by Life" <${process.env.SMTP_USER}>`,
      to,
      subject: "Response to Your Inquiry",
      text: `Dear Customer,\n\n${message}\n\nBest regards,\nCoffee Beats by Life Team`,
      html: `
        <p>Dear Customer,</p>
        <p>${message}</p>
        <p>Best regards,<br><strong>Coffee Beats by Life Team</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // ✅ Update replied field in DB
    await prisma.message.update({
      where: { id: messageId },
      data: { replied: true },
    });

    return NextResponse.json({
      success: true,
      message: "Email sent and status updated",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Email sending failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
