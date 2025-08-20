import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all reservations
export async function GET() {
  const reservations = await db.reservation.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(reservations);
}

// Create a reservation
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { date, timeSlot, guests } = await req.json();
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
