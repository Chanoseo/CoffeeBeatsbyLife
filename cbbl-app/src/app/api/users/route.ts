// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, image, role, password } = await req.json();

    // Validate required fields
    if (!name || !email || !role || !password || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Please fill all required fields and ensure password is at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if email exists
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
      data: { name, email: normalizedEmail, image, role, passwordHash },
    });

    // Generate verification token (expires in 24h)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"Coffee Beats" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Verify Your Coffee Beats Account",
      html: `
        <p>Hi ${name},</p>
        <p>Your account has been created. Please verify your email by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not create this account, ignore this email.</p>
      `,
    });

    return NextResponse.json(
      {
        message: `User added successfully. Verification email sent to ${email}.`,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

// GET /api/users/check?email=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  return NextResponse.json({ exists: !!user });
}
