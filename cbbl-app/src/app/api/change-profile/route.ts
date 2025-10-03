// api/change-profile/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "cloudinary";

const prisma = new PrismaClient();

// Configure cloudinary once here
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string | null;
    const password = formData.get("password") as string | null;
    const file = formData.get("image") as File | null;

    // Build update data with strict typing
    const dataToUpdate: {
      name?: string;
      passwordHash?: string;
      image?: string;
    } = {};

    if (name && name.trim()) dataToUpdate.name = name.trim();
    if (password && password.trim()) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    // Fetch existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle Cloudinary image upload
    if (file) {
      // Delete old image from Cloudinary if it exists
      if (existingUser.image) {
        try {
          const urlParts = existingUser.image.split("/");
          const fileNameWithExt = urlParts[urlParts.length - 1];
          const publicId = `profile_images/${fileNameWithExt.split(".")[0]}`;
          await cloudinary.v2.uploader.destroy(publicId);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }

      // Upload new file
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name.split(".")[0];

      const uploaded = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              folder: "profile_images",
              public_id: originalName,
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

    // Update user in DB
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
