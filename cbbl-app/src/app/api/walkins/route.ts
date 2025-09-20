import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ GET /api/walkins → Fetch all walk-ins
export async function GET() {
  try {
    const walkIns = await prisma.walkIn.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seat: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, walkIns });
  } catch (err) {
    console.error("Error fetching walk-ins:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch walk-ins" },
      { status: 500 }
    );
  }
}

// ✅ POST /api/walkins → Create a walk-in
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seatId, guest, startTime, endTime } = body;

    if (!seatId || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const walkIn = await prisma.walkIn.create({
      data: {
        seatId,
        guest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return NextResponse.json({ success: true, walkIn }, { status: 201 });
  } catch (err) {
    console.error("Error creating walk-in:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
