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
    const { seatIds, guest, startTime, endTime } = body;

    // Validate inputs
    if (!seatIds?.length || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure guest is either a single number or an array of numbers
    let guestArray: number[] = [];
    if (Array.isArray(guest)) {
      guestArray = guest;
    } else if (typeof guest === "number") {
      guestArray = Array(seatIds.length).fill(guest); // same guest count for all seats
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid guest field" },
        { status: 400 }
      );
    }

    // ✅ Create a walk-in per seat with the corresponding guest count
    const creations = seatIds.map((seatId: string, i: number) =>
      prisma.walkIn.create({
        data: {
          seatId,
          guest: guestArray[i] || 1, // fallback to 1 if undefined
          startTime: new Date(startTime),
          endTime: new Date(endTime),
        },
      })
    );

    const walkIns = await Promise.all(creations);

    return NextResponse.json({ success: true, walkIns }, { status: 201 });
  } catch (err) {
    console.error("Error creating walk-in:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
