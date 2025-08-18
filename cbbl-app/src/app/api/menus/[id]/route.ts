import { NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET one menu item
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await mongoClientPromise;
    const db = client.db();
    const item = await db.collection("menus").findOne({ _id: new ObjectId(params.id) });

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    console.error("GET /api/menus/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// UPDATE a menu item
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const client = await mongoClientPromise;
    const db = client.db();

    const result = await db.collection("menus").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/menus/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE a menu item
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await mongoClientPromise;
    const db = client.db();

    const result = await db.collection("menus").deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/menus/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
