import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: normalizedEmail,
        passwordHash,
        role: "user",
      },
    });

    // Generate verification token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h expiry

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
      },
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      to: normalizedEmail,
      subject: "Verify Your Coffee Beats By Life Account",
      html: `
        <p>Dear ${firstName} ${lastName},</p>
        <p>Thank you for registering with Coffee Beats By Life. Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Your Email</a></p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Best regards,<br/>The Coffee Beats By Life Team</p>
      `,
    });

    return NextResponse.json(
      { message: "User created. Please verify your email.", user: newUser },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
