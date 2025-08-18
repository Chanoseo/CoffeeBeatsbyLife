import { NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all menus
export async function GET() {
  try {
    const client = await mongoClientPromise;
    const db = client.db();
    const menus = await db.collection("menus").find().toArray();
    return NextResponse.json(menus, { status: 200 });
  } catch (err) {
    console.error("GET /api/menus error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST new menu item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, description, price, image } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price required" }, { status: 400 });
    }

    const client = await mongoClientPromise;
    const db = client.db();
    const result = await db.collection("menus").insertOne({
      name,
      category,
      description,
      price,
      image,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId, name, price }, { status: 201 });
  } catch (err) {
    console.error("POST /api/menus error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
