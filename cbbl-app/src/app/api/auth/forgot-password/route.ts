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
      from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request – Coffee Beats By Life",
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
                Password Reset Request
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
              <p style="color: #555555;">Dear ${user.name || "Valued Customer"},</p>

              <p style="color: #555555;">
                We received a request to reset your Coffee Beats By Life account password.
              </p>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${resetUrl}" style="
                  background-color: rgb(60, 96, 76);
                  color: #ffffff;
                  font-weight: 700;
                  font-size: 18px;
                  padding: 16px 32px;
                  border-radius: 12px;
                  text-decoration: none;
                  display: inline-block;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                ">
                  Reset My Password
                </a>
              </div>

              <p style="color: #555555;">
                This link is valid for 1 hour. If you did not request a password reset, please ignore this email.
              </p>

              <p style="color: #555555;">Sincerely,<br/><strong>Coffee Beats By Life Team</strong></p>

              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 35px 0;">

              <p style="font-size: 12px; color: #999999; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
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
