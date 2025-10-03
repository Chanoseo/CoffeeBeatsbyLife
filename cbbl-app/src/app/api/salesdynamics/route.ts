import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
      10
    );

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["Completed", "Paid"] },
        createdAt: {
          gte: new Date(`${year}-01-01T00:00:00Z`),
          lte: new Date(`${year}-12-31T23:59:59Z`),
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const monthlySales: Record<string, number> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthName = MONTHS[date.getMonth()];
      monthlySales[monthName] =
        (monthlySales[monthName] || 0) + order.totalAmount;
    });

    const chartData = MONTHS.map((m) => ({
      name: m,
      sales: monthlySales[m] || 0,
    }));

    return NextResponse.json(chartData);
  } catch (err) {
    console.error("Error fetching sales dynamics:", err);
    return NextResponse.json(
      { error: "Failed to fetch sales dynamics" },
      { status: 500 }
    );
  }
}
