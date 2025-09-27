// app/api/favorites/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Add/Remove favorite
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already favorite
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId: user.id, productId },
    },
  });

  if (existing) {
    // ❌ Remove from favorites
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, favorited: false });
  } else {
    // ❤️ Add to favorites
    await prisma.favorite.create({
      data: { userId: user.id, productId },
    });
    return NextResponse.json({ success: true, favorited: true });
  }
}

// Check if a product is in favorites
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ favorited: false });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ favorited: false });

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: { userId: user.id, productId: productId! },
    },
  });

  return NextResponse.json({ favorited: !!existing });
}
