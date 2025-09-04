import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ hasPreOrder: false }, { status: 401 });
    }

    const userId = session.user.id;

    // 👇 Adjust statuses depending on what you consider "active"
    const activeStatuses = ["Pending", "Confirmed", "Preparing", "Ready"];

    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: activeStatuses },
      },
    });

    return NextResponse.json({
      hasPreOrder: !!existingOrder,
      orderId: existingOrder?.id || null,
    });
  } catch (error) {
    console.error("Error checking pre-order:", error);
    return NextResponse.json(
      { error: "Failed to check pre-order", hasPreOrder: false },
      { status: 500 }
    );
  }
}
