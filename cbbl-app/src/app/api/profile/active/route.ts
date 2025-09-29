import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      status: { in: ["Pending", "Confirmed", "Preparing", "Ready"] },
    },
    include: {
      items: { include: { product: true } },
      seat: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
