import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/seats/:id → Update a seat
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // ✅ no await needed
    const body = await req.json();
    const { name, status } = body;

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
        status: status.trim(),
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id; // ✅ no await needed

    const seat = await prisma.seat.findUnique({ where: { id } });

    if (!seat) {
      return NextResponse.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    if (seat.status === "Reserved") {
      return NextResponse.json(
        { success: false, message: "Cannot delete a reserved seat" },
        { status: 400 }
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
