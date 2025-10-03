import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const years = await prisma.order.findMany({
      where: { status: { in: ["Completed"] } },
      select: { createdAt: true },
    });

    const uniqueYears = Array.from(
      new Set(years.map((o) => new Date(o.createdAt).getFullYear()))
    ).sort((a, b) => b - a);

    return NextResponse.json(uniqueYears);
  } catch (err) {
    console.error("Error fetching sales years:", err);
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}
