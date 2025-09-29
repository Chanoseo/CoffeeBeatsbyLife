// api>products>route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Minimal Cloudinary response type
type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
};

// Default image from Cloudinary
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dzqv6m3wa/image/upload/v1756286166/products/lentil_bolognese.jpg";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const categoryId = formData.get("categoryId") as string;
    const isNew = formData.get("isNew") === "on";
    const isBestSeller = formData.get("isBestSeller") === "on";
    const type = formData.get("type") as "FOOD" | "DRINK"; // ✅ get type

    // ✅ Get drink sizes if type is DRINK
    let mediumPrice: number | null = null;
    let largePrice: number | null = null;

    if (type === "DRINK") {
      mediumPrice = parseFloat(formData.get("mediumPrice") as string) || 0;
      largePrice = parseFloat(formData.get("largePrice") as string) || 0;
    }

    const file = formData.get("image") as File | null;
    let imageUrl = DEFAULT_IMAGE; // use Cloudinary default

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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        isNew,
        isBestSeller,
        type, // ✅ save Food or Drink
        category: { connect: { id: categoryId } },
        imageUrl, // always valid image
        mediumPrice: type === "DRINK" ? mediumPrice : null,
        largePrice: type === "DRINK" ? largePrice : null,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add product" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryName = url.searchParams.get("category");

    let products;
    if (categoryName) {
      products = await prisma.product.findMany({
        where: { category: { name: categoryName } },
        include: {
          category: true,
          _count: { select: { orderItems: true } }, // ✅ count orders
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      products = await prisma.product.findMany({
        include: {
          category: true,
          _count: { select: { orderItems: true } }, // ✅ count orders
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // ✅ map _count into totalOrders
    const data = products.map((p) => ({
      ...p,
      totalOrders: p._count.orderItems,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
