// api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ GET /api/orders/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await first

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        seat: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ✅ PUT /api/orders/:id
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await first
    const body = await req.json();
    const { status, endTime } = body;

    if (!status && !endTime) {
      return NextResponse.json(
        { error: "Status or endTime is required" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(endTime && { endTime: new Date(endTime) }),
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/orders/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ await first

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Order deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
