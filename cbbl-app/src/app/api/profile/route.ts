// api/profile/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import nodemailer from "nodemailer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET user info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json(null);

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, image: true },
  });

  return NextResponse.json(user);
}

// PUT for updating profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const password = formData.get("password") as string | null;
    const file = formData.get("image") as File | null;

    const dataToUpdate: {
      name?: string;
      passwordHash?: string;
      image?: string;
    } = {};
    if (name) dataToUpdate.name = name;
    if (password) dataToUpdate.passwordHash = await bcrypt.hash(password, 10);

    // Fetch existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (file) {
      // Delete old image from Cloudinary if exists
      if (existingUser.image) {
        try {
          const urlParts = existingUser.image.split("/");
          const fileNameWithExt = urlParts[urlParts.length - 1];
          const publicId = `profile_images/${fileNameWithExt.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      // Upload new image with the same public_id as the old image (or file name)
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name.split(".")[0];

      const uploaded = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "profile_images",
              public_id: originalName, // same name, will overwrite if exists
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        }
      );

      dataToUpdate.image = uploaded.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    // 📧 Email notification only if password changed
    if (password) {
      try {
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
          to: session.user.email,
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
                    Dear ${session.user.name || "Valued Customer"},
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
      } catch (emailErr) {
        console.error("Failed to send password change email:", emailErr);
      }
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
