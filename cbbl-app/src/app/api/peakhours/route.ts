import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function formatHour(hour: number) {
  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour} ${ampm}`;
}

const hoursRange = Array.from({ length: 18 }, (_, i) => 7 + i);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    // Use const instead of let
    const selectedDate = dateParam ? new Date(dateParam) : new Date();

    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59,
      999
    );

    const [orders, walkins] = await Promise.all([
      prisma.order.findMany({
        where: {
          startTime: { lte: endOfDay },
          endTime: { gte: startOfDay },
        },
        select: { startTime: true, endTime: true, guest: true },
      }),
      prisma.walkIn.findMany({
        where: {
          startTime: { lte: endOfDay },
          endTime: { gte: startOfDay },
        },
        select: { startTime: true, endTime: true, guest: true },
      }),
    ]);

    const allData = [...orders, ...walkins];

    const aggregated: Record<number, number> = {};
    hoursRange.forEach((h) => (aggregated[h] = 0));

    allData.forEach((entry) => {
      const guests = entry.guest ?? 1;
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);

      hoursRange.forEach((h) => {
        const hourStart = new Date(startOfDay);
        hourStart.setHours(h, 0, 0, 0);

        const hourEnd = new Date(startOfDay);
        hourEnd.setHours(h + 1, 0, 0, 0);

        // Count guests only if the order/walk-in overlaps this hour
        if (startTime < hourEnd && endTime > hourStart) {
          aggregated[h] += guests;
        }
      });
    });

    const result = hoursRange.map((hour) => ({
      hour: formatHour(hour),
      customers: aggregated[hour] || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Peak Hours Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
