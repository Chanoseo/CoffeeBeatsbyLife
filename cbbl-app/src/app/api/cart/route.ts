import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mongoClientPromise } from "@/lib/mongodb";

// GET cart items
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  const cart = await db.collection("carts").findOne({ userEmail: session.user.email });
  return NextResponse.json(cart ?? { userEmail: session.user.email, items: [] });
}

// ADD item to cart
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuId, quantity = 1 } = await req.json();
  if (!menuId) return NextResponse.json({ error: "menuId required" }, { status: 400 });

  const client = await mongoClientPromise;
  const db = client.db();

  const carts = db.collection("carts");

  await carts.updateOne(
    { userEmail: session.user.email },
    {
      $setOnInsert: { userEmail: session.user.email },
      $inc: { [`items.${menuId}`]: quantity },
    },
    { upsert: true }
  );

  return NextResponse.json({ message: "Item added to cart" }, { status: 201 });
}

// CLEAR entire cart
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  await db.collection("carts").deleteOne({ userEmail: session.user.email });
  return NextResponse.json({ message: "Cart cleared" });
}
