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
      from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
      to: normalizedEmail,
      subject: "Verify Your Coffee Beats By Life Account",
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
                Verify Your Account
              </h1>
            </div>

            <!-- Body -->
            <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
              <p style="color: #555555;">Dear ${firstName} ${lastName},</p>

              <p style="color: #555555;">
                Thank you for registering with Coffee Beats By Life. Please verify your email address by clicking the button below:
              </p>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${verificationUrl}" style="
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
                  Verify Email
                </a>
              </div>

              <p style="color: #555555;">
                If you did not create this account, please ignore this email.
              </p>

              <p style="color: #555555;">
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
