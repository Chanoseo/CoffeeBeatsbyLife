import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function PUT(req: NextRequest) {
  try {
    const { name, email, role, password } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Prepare the update object
    const updateData: { name: string; role: string; passwordHash?: string } = {
      name,
      role,
    };

    // If password is provided, hash it
    if (password) {
      const passwordHash = await hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
