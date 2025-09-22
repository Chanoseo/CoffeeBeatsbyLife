import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "user" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        orders: {
          select: {
            id: true,
            status: true,
            startTime: true,
            endTime: true,
            guest: true,
            totalAmount: true,
            seat: {
              select: { name: true },
            },
            items: {
              select: {
                quantity: true,
                product: {
                  select: { name: true, price: true, imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
