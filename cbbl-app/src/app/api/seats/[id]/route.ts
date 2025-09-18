import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/seats/:id → Update a seat
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 fix: params is a Promise
) {
  try {
    const { id } = await context.params; // 👈 await it
    const body = await req.json();
    const { name, status, capacity } = body;

    if (!name?.trim() || !status?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name and status are required" },
        { status: 400 }
      );
    }

    const seat = await prisma.seat.update({
      where: { id },
      data: {
        name: name.trim(),
        capacity: capacity ?? null,
      },
    });

    return NextResponse.json({ success: true, seat });
  } catch (error: unknown) {
    console.error("Error updating seat:", error);
    let message = "Failed to update seat";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE /api/seats/:id → Delete a seat
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 same fix
) {
  try {
    const { id } = await context.params; // 👈 await it

    const seat = await prisma.seat.findUnique({ where: { id } });

    if (!seat) {
      return NextResponse.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    const hasOrders = await prisma.order.findFirst({ where: { seatId: id } });
    if (hasOrders) {
      return NextResponse.json(
        { success: false, message: "Cannot delete a seat linked to an order" },
        { status: 400 }
      );
    }

    await prisma.seat.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Seat deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting seat:", error);
    let message = "Failed to delete seat";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
