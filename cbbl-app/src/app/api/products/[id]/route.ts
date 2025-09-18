// api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
};

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dzqv6m3wa/image/upload/v1756286166/products/lentil_bolognese.jpg";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params; // ✅ await first

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const categoryId = formData.get("categoryId") as string;
    const isNew = formData.get("isNew") === "true";
    const isBestSeller = formData.get("isBestSeller") === "true";
    const type = formData.get("type") as "FOOD" | "DRINK";

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    let imageUrl = existingProduct.imageUrl || DEFAULT_IMAGE;

    const file = formData.get("image") as File | null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const originalName = file.name.split(".")[0];

      const uploadResult: CloudinaryUploadResult = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              public_id: originalName,
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );
          stream.end(buffer);
        }
      );

      imageUrl = uploadResult.secure_url;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        category: { connect: { id: categoryId } },
        isNew,
        isBestSeller,
        type,
        imageUrl,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await context.params; // ✅ await first

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.imageUrl && product.imageUrl !== DEFAULT_IMAGE) {
      try {
        const urlParts = product.imageUrl.split("/");
        const fileNameWithExt = urlParts[urlParts.length - 1];
        const publicId = `products/${fileNameWithExt.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.error("Cloudinary image delete error:", cloudErr);
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
