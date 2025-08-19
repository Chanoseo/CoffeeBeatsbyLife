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
      to: user.email,
      subject: "Confirmation of Password Change",
      html: `
    <p>Dear ${user.name || "Coffee Beats By Life User"},</p>

    <p>We are writing to inform you that the password associated with your Coffee Beats By Life account has been successfully updated.</p>
    
    <p>If you did not authorize this change, please contact our support team immediately at 
    <a href="mailto:kristianjosefrbanatlao@gmail.com">kristianjosefrbanatlao@gmail.com</a> to secure your account.</p>
    
    <br/>
    <p>Sincerely,<br/>The Coffee Beats By Life Team</p>
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
