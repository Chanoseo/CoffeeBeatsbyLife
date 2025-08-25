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

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: "desc", // newest first
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
