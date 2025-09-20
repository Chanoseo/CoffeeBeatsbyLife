// api/walkins/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ PUT /api/walkins/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { endTime } = await req.json();

    if (!endTime) {
      return NextResponse.json(
        { error: "endTime is required" },
        { status: 400 }
      );
    }

    const walkIn = await prisma.walkIn.findUnique({
      where: { id },
    });

    if (!walkIn) {
      return NextResponse.json({ error: "Walk-in not found" }, { status: 404 });
    }

    // Optional: check for overlapping times with other walk-ins for the same seat
    const overlap = await prisma.walkIn.findFirst({
      where: {
        seatId: walkIn.seatId,
        id: { not: id },
        startTime: { lt: new Date(endTime) },
        endTime: { gt: walkIn.startTime },
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Selected time overlaps with another walk-in" },
        { status: 400 }
      );
    }

    const updatedWalkIn = await prisma.walkIn.update({
      where: { id },
      data: { endTime: new Date(endTime) },
    });

    return NextResponse.json(updatedWalkIn, { status: 200 });
  } catch (error) {
    console.error("Update walk-in error:", error);
    return NextResponse.json(
      { error: "Failed to update walk-in" },
      { status: 500 }
    );
  }
}
