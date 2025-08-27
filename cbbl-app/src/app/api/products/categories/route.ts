import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json({ success: true, category });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to add category" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json({ success: false, error: "Category ID is required" }, { status: 400 });
    }

    // Optional: check if category has products
    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 });
  }
}

