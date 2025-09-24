import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch 4 products with highest total orders
    const products = await prisma.product.findMany({
      take: 4,
      orderBy: {
        orderItems: {
          _count: "desc", // products with most orders first
        },
      },
      include: {
        orderItems: true, // include to count total orders
      },
    });

    // Map to include totalOrders count
    const result = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      imageUrl: p.imageUrl,
      totalOrders: p.orderItems.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
