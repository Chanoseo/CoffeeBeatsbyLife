import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all seats
export async function GET() {
  const seats = await db.seat.findMany({
    include: {
      reservations: {
        select: { id: true, date: true, timeSlot: true, status: true }
      }
    },
    orderBy: { seatNumber: "asc" }
  });
  return NextResponse.json(seats);
}

// Create a new seat
export async function POST(req: Request) {
  try {
    const { seatNumber, capacity } = await req.json();

    if (!seatNumber || !capacity) {
      return NextResponse.json({ error: "seatNumber and capacity required" }, { status: 400 });
    }

    const seat = await db.seat.create({
      data: {
        seatNumber,
        capacity,
        isAvailable: true
      }
    });

    return NextResponse.json(seat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create seat" }, { status: 500 });
  }
}
