import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ exists: false });
  }

  const seat = await prisma.seat.findFirst({
    where: { name: name.trim() },
  });

  return NextResponse.json({ exists: !!seat });
}
