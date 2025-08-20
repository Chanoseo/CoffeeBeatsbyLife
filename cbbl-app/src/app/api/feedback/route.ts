import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const feedbacks = await db.feedback.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(feedbacks);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rating, comment } = await req.json();
  const feedback = await db.feedback.create({
    data: {
      userId: session.user.id,
      rating,
      comment
    }
  });
  return NextResponse.json(feedback, { status: 201 });
}
