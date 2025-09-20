import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, password } = await req.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: { name, email: normalizedEmail, passwordHash, role },
    });

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h expiry
    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Coffee Beats By Life Account Verification",
      html: `
    <div>
      <h2>Dear ${name},</h2>
      <p>We are pleased to inform you that your Coffee Beats By Life account has been successfully created.</p>
      <p>To complete the registration process and activate your account, please verify your email address by clicking the link below:</p>
      <p>
        <a href="${verificationUrl}">Verify Email</a>
      </p>
      <p>If you did not create this account, please disregard this message.</p>
      <p>Thank you for joining Coffee Beats By Life.</p>
      <p>Sincerely,<br/><strong>The Coffee Beats By Life Team</strong></p>
    </div>
  `,
    });

    return NextResponse.json(
      {
        message: `User added successfully. Verification email sent to ${email}.`,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}
