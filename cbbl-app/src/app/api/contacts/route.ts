import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Basic validation
    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim() ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields are required and must be valid." },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const cleanName = name.replace(/<[^>]*>?/gm, "");
    const cleanEmail = email.replace(/<[^>]*>?/gm, "");
    const cleanMessage = message.replace(/<[^>]*>?/gm, "");

    const newMessage = await prisma.message.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        content: cleanMessage,
      },
    });

    return NextResponse.json(
      { success: true, message: newMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message. Please try again later." },
      { status: 500 }
    );
  }
}
