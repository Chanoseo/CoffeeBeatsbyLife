import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reservation = await db.reservation.findUnique({ where: { id: params.id } });
  if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Free seat if assigned
  if (reservation.seatId) {
    await db.seat.update({
      where: { id: reservation.seatId },
      data: { isAvailable: true }
    });
  }

  await db.reservation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
