import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import transporter from "@/lib/nodemailer"; // <-- make sure you have this configured

export async function POST(req: NextRequest) {
  try {
    const { token, password } = (await req.json()) as {
      token: string;
      password: string;
    };

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password" },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token is invalid or expired" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.identifier },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

    // Send confirmation email
    await transporter.sendMail({
      from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Confirmation of Password Change",
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
                Password Change Confirmation
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
              <p style="color: #555555;">Dear ${user.name || "Coffee Beats By Life User"},</p>

              <p style="color: #555555;">
                We are writing to inform you that the password associated with your Coffee Beats By Life account has been successfully updated.
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
                  Password Updated
                </p>
              </div>

              <p style="color: #555555;">
                If you did not authorize this change, please contact our support team immediately at 
                <a href="mailto:kristianjosefrbanatlao@gmail.com" style="color: rgb(60, 96, 76); font-weight: 700;">kristianjosefrbanatlao@gmail.com</a> to secure your account.
              </p>

              <p style="color: #555555;">
                Thank you for using our services. We appreciate your trust and look forward to serving you again.
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
      message: "Password reset successfully and email notification sent.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
