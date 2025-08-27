import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Get current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true
    }
  });

  return NextResponse.json(user);
}

// Update current user profile
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, image } = await req.json();

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      image
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true
    }
  });

  return NextResponse.json(updated);
}
