import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // your Prisma client

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { email },
  });

  return NextResponse.json({ exists: !!user });
}
