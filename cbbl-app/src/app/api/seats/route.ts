import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    if (!seatName || seatName.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Seat name required" },
        { status: 400 }
      );
    }

    if (!capacity || capacity < 1) {
      return NextResponse.json(
        { success: false, message: "Capacity must be at least 1" },
        { status: 400 }
      );
    }

    const seat = await prisma.seat.create({
      data: {
        name: seatName.trim(),
        capacity,
      },
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
