import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import nodemailer from "nodemailer";

export async function PUT(req: NextRequest) {
  try {
    const { name, email, role, password } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Prepare the update object
    const updateData: { name: string; role: string; passwordHash?: string } = {
      name,
      role,
    };

    // Track if password was changed
    const passwordChanged = !!password;

    // If password is provided, hash it
    if (password) {
      const passwordHash = await hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    // Send email if password changed
    if (passwordChanged) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Changed Successfully – Coffee Beats By Life",
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
                  Password Updated
                </h1>
              </div>

              <!-- Body -->
              <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                <p style="color: #555555;">
                  Dear ${updatedUser.name || "Valued Customer"},
                </p>

                <p style="color: #555555;">
                  We wanted to let you know that your <strong>Coffee Beats By Life</strong> account password was successfully updated.
                </p>

                <p style="color: #555555;">
                  If this wasn’t you, please reset your password immediately or contact our support team.
                </p>

                <p style="color: #555555; margin-top: 25px;">
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
      });
    }

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
