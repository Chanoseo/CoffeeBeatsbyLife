import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PUT /api/seats/:id → Update a seat
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const contentType = req.headers.get("content-type") || "";

    let name = "";
    let status = "";
    let capacity: number | null = null;
    let description: string | null = null;
    let imageUrl: string | null = null;

    // fetch existing seat (for image reuse)
    const existingSeat = await prisma.seat.findUnique({ where: { id } });
    if (!existingSeat) {
      return NextResponse.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = (formData.get("seat") as string) || "";
      status = (formData.get("status") as string) || "";
      capacity = parseInt(formData.get("capacity") as string, 10) || null;
      description = (formData.get("description") as string) || "";

      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());

        // --- compute publicId robustly from existingSeat.imageUrl (if any) ---
        let publicId: string;
        if (existingSeat.imageUrl) {
          try {
            // Use URL parsing + path logic to extract "seats/your_public_id" (without extension)
            const parsed = new URL(existingSeat.imageUrl);
            const pathParts = parsed.pathname.split("/").filter(Boolean); // remove empty entries
            // find index of "seats" (folder you use)
            const idx = pathParts.findIndex((p) => p === "seats");
            let idPath = "";
            if (idx !== -1) {
              idPath = pathParts.slice(idx).join("/"); // e.g. "seats/my_image_123.jpg"
            } else {
              // fallback: take last two path parts (folder + filename) if you used a folder
              idPath = pathParts.slice(-2).join("/");
            }
            // remove file extension if present
            const dotIdx = idPath.lastIndexOf(".");
            if (dotIdx !== -1) idPath = idPath.substring(0, dotIdx);
            publicId = idPath;
          } catch {
            // fallback extraction if URL parsing fails
            const parts = existingSeat.imageUrl.split("/");
            publicId = parts
              .slice(parts.indexOf("seats"))
              .join("/")
              .split(".")[0];
          }
        } else {
          // no existing image -> create a new public id in seats/ folder
          const baseName = imageFile.name.split(".")[0];
          publicId = `seats/${baseName}_${Date.now()}`;
        }

        // --- upload to Cloudinary reusing public_id and overwriting the previous asset ---
        const result: UploadApiResponse = await new Promise(
          (resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: publicId,
                overwrite: true, // replace the existing image
                invalidate: true, // invalidate cached versions
                folder: undefined, // public_id already contains folder (e.g. seats/...), so avoid double folder
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result as UploadApiResponse);
              }
            );
            stream.end(buffer);
          }
        );

        imageUrl = result.secure_url ?? null;
      }
    } else {
      const body = await req.json();
      name = body.name || "";
      status = body.status || "";
      capacity = body.capacity ?? null;
      description = body.description ?? null;
      imageUrl = body.imageUrl ?? existingSeat.imageUrl ?? null;
    }

    if (!name.trim() || !status.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and status are required" },
        { status: 400 }
      );
    }

    // Normalize fields to avoid TS type mismatch with Prisma (string | undefined expected)
    const seat = await prisma.seat.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description ?? undefined,
        ...(typeof capacity === "number" && !isNaN(capacity)
          ? { capacity }
          : {}),
        ...(imageUrl ? { imageUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, seat });
  } catch (error: unknown) {
    console.error("Error updating seat:", error);
    let message = "Failed to update seat";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE /api/seats/:id → Delete a seat
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const seat = await prisma.seat.findUnique({ where: { id } });
    if (!seat) {
      return NextResponse.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    const hasOrders = await prisma.order.findFirst({ where: { seatId: id } });
    if (hasOrders) {
      return NextResponse.json(
        { success: false, message: "Cannot delete a seat linked to an order" },
        { status: 400 }
      );
    }

    // 👇 If the seat has an image, delete it from Cloudinary
    if (seat.imageUrl) {
      try {
        const parsed = new URL(seat.imageUrl);
        const pathParts = parsed.pathname.split("/").filter(Boolean);

        const idx = pathParts.findIndex((p) => p === "seats");
        let publicId = "";
        if (idx !== -1) {
          publicId = pathParts.slice(idx).join("/"); // seats/filename.jpg
        } else {
          publicId = pathParts.slice(-2).join("/");
        }
        // remove extension
        const dotIdx = publicId.lastIndexOf(".");
        if (dotIdx !== -1) publicId = publicId.substring(0, dotIdx);

        // destroy from cloudinary
        await cloudinary.uploader.destroy(publicId, {
          invalidate: true,
          resource_type: "image",
        });
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }

    // delete seat record
    await prisma.seat.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Seat and image deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting seat:", error);
    let message = "Failed to delete seat";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
