import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const preOrders = await db.preOrder.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(preOrders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, pickupAt } = await req.json();
  const preOrder = await db.preOrder.create({
    data: {
      userId: session.user.id,
      items,
      pickupAt: new Date(pickupAt)
    }
  });
  return NextResponse.json(preOrder, { status: 201 });
}
