import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get single seat
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const seat = await db.seat.findUnique({
    where: { id: params.id },
    include: { reservations: true }
  });

  if (!seat) return NextResponse.json({ error: "Seat not found" }, { status: 404 });

  return NextResponse.json(seat);
}

// Update seat
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    const updated = await db.seat.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update seat" }, { status: 500 });
  }
}

// Delete seat
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await db.seat.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete seat" }, { status: 500 });
  }
}
