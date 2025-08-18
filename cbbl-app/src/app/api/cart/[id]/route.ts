import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mongoClientPromise } from "@/lib/mongodb";

// UPDATE item quantity
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quantity } = await req.json();
  if (typeof quantity !== "number" || quantity <= 0) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  await db.collection("carts").updateOne(
    { userEmail: session.user.email },
    { $set: { [`items.${params.id}`]: quantity } }
  );

  return NextResponse.json({ message: "Quantity updated" });
}

// REMOVE item from cart
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  await db.collection("carts").updateOne(
    { userEmail: session.user.email },
    { $unset: { [`items.${params.id}`]: "" } }
  );

  return NextResponse.json({ message: "Item removed" });
}
