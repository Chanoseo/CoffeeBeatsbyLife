import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/seats → Fetch all seats
export async function GET() {
  try {
    const seats = await prisma.seat.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
          },
        },
        walkIns: {
          select: {
            id: true,
            guest: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, seats });
  } catch (error) {
    console.error("Error fetching seats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch seats" },
      { status: 500 }
    );
  }
}

// POST /api/seats → Add a new seat
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const seatName = formData.get("seat") as string;
    const capacity = parseInt(formData.get("capacity") as string, 10);
    const description = (formData.get("description") as string) || "";

    if (!seatName?.trim())
      return NextResponse.json(
        { success: false, message: "Seat name required" },
        { status: 400 }
      );
    if (!capacity || capacity < 1)
      return NextResponse.json(
        { success: false, message: "Capacity must be at least 1" },
        { status: 400 }
      );

    let imageUrl = "";
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());

      // Generate a unique name using original file name + timestamp
      const originalName = imageFile.name.split(".")[0];
      const timestamp = Date.now();
      const uniqueName = `${originalName}_${timestamp}`;

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "seats",
            public_id: uniqueName, // now unique
            overwrite: false, // prevent overwriting
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
          }
        );
        stream.end(buffer);
      });

      imageUrl = result.secure_url;
    }

    const seat = await prisma.seat.create({
      data: { name: seatName.trim(), capacity, description, imageUrl },
    });

    return NextResponse.json({ success: true, seat });
  } catch (error) {
    console.error("Error creating seat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add seat" },
      { status: 500 }
    );
  }
}
