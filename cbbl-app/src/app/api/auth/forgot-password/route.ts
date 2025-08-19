import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Always respond success to avoid revealing emails
      return NextResponse.json({
        message: "If this email exists, a link has been sent.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // ✅ Let Prisma generate the MongoDB ObjectId automatically
    await prisma.passwordResetToken.create({
      data: { identifier: email, token, expires },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request – Coffee Beats By Life",
      html: `
    <p>Dear User,</p>
    <p>We received a request to reset your Coffee Beats By Life account password.</p>
    <p>Please click the link below to reset your password. This link is valid for 1 hour:</p>
    <p><a href="${resetUrl}">Reset My Password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Best regards,<br/>The Coffee Beats By Life Team</p>
  `,
    });

    return NextResponse.json({
      message: "If this email exists, a link has been sent.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
