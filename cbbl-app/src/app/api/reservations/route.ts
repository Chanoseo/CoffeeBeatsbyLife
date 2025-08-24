import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all reservations
export async function GET() {
  const reservations = await db.reservation.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      seat: { select: { id: true, seatNumber: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reservations);
}

// Create a reservation with seat
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, timeSlot, guests, seatId } = await req.json();

  // ✅ Check if seat exists
  if (seatId) {
    const seat = await db.seat.findUnique({ where: { id: seatId } });
    if (!seat) return NextResponse.json({ error: "Seat not found" }, { status: 404 });
    if (!seat.isAvailable) {
      return NextResponse.json({ error: "Seat already taken" }, { status: 400 });
    }

    // Create reservation + lock seat
    const reservation = await db.reservation.create({
      data: {
        userId: session.user.id,
        date: new Date(date),
        timeSlot,
        guests,
        seatId
      }
    });

    await db.seat.update({
      where: { id: seatId },
      data: { isAvailable: false }
    });

    return NextResponse.json(reservation, { status: 201 });
  }

  // Fallback: no seat reservation
  const reservation = await db.reservation.create({
    data: {
      userId: session.user.id,
      date: new Date(date),
      timeSlot,
      guests
    }
  });

  return NextResponse.json(reservation, { status: 201 });
}
