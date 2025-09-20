// app/api/users/all/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { name: true, email: true, image: true, role: true },
  });
  return NextResponse.json(users);
}
