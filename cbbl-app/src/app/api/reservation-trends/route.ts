// app/api/reservation-trends/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const previousYear = currentYear - 1;

    // Fetch all orders for current and previous year
    const orders = await prisma.order.findMany({
      select: { startTime: true },
      where: {
        startTime: {
          gte: new Date(previousYear, 0, 1),
          lte: new Date(currentYear, 11, 31, 23, 59, 59),
        },
      },
    });

    // Initialize months 0-11
    const months = Array.from({ length: 12 }, (_, i) => i);

    const result = months.map((m) => {
      const current = orders.filter(
        (o) =>
          o.startTime.getFullYear() === currentYear &&
          o.startTime.getMonth() === m
      ).length;

      const previous = orders.filter(
        (o) =>
          o.startTime.getFullYear() === previousYear &&
          o.startTime.getMonth() === m
      ).length;

      return {
        month: new Date(0, m).toLocaleString("default", { month: "short" }),
        current,
        previous,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Reservation Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation trends" },
      { status: 500 }
    );
  }
}
