import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const queue = await db.queue.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json(queue);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { position } = await req.json();
  const entry = await db.queue.create({
    data: {
      userId: session.user.id,
      position
    }
  });
  return NextResponse.json(entry, { status: 201 });
}
