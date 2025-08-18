import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mongoClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/orders/:id  -> view one order (must belong to user)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  let _id: ObjectId;
  try {
    _id = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const order = await db
    .collection("orders")
    .findOne({ _id, userEmail: session.user.email });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order, { status: 200 });
}

// (Optional) DELETE /api/orders/:id  -> cancel if still pending
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  const _id = new ObjectId(params.id);

  const result = await db.collection("orders").findOneAndUpdate(
    { _id, userEmail: session.user.email, status: "pending" },
    { $set: { status: "cancelled", updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  if (!result.value) {
    return NextResponse.json(
      { error: "Order not found or not cancellable" },
      { status: 400 }
    );
  }

  return NextResponse.json(result.value, { status: 200 });
}
