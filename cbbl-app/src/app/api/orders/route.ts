import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { mongoClientPromise } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type CartDoc = {
  userEmail: string;
  items: Record<string, number>; // { menuId: qty }
};

type MenuItem = {
  _id: ObjectId;
  name: string;
  price: number;
  image?: string;
  category?: string;
};

function makeOrderNumber() {
  // e.g. CBBL-20250307-AB12
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CBBL-${y}${m}${day}-${r}`;
}

// GET /api/orders  -> list my orders
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  const orders = await db
    .collection("orders")
    .find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(orders, { status: 200 });
}

// POST /api/orders  -> create order from cart (checkout)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await mongoClientPromise;
  const db = client.db();

  // load cart
  const cart = (await db.collection("carts").findOne({
    userEmail: session.user.email,
  })) as CartDoc | null;

  if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // fetch menu items for all ids in cart
  const ids = Object.keys(cart.items)
    .filter(Boolean)
    .map((id) => new ObjectId(id));

  const menuDocs = (await db
    .collection("menus")
    .find({ _id: { $in: ids } })
    .toArray()) as MenuItem[];

  if (menuDocs.length === 0) {
    return NextResponse.json(
      { error: "Cart contains invalid items" },
      { status: 400 }
    );
  }

  // build order lines using current prices
  const lines = menuDocs.map((m) => {
    const qty = cart.items[String(m._id)] ?? 0;
    const unitPrice = Number(m.price);
    const lineTotal = +(unitPrice * qty).toFixed(2);
    return {
      menuId: m._id,
      name: m.name,
      image: m.image,
      category: m.category,
      quantity: qty,
      unitPrice,
      lineTotal,
    };
  });

  const subTotal = +lines.reduce((s, l) => s + l.lineTotal, 0).toFixed(2);

  // simple tax/shipping (adjust to your rules)
  const taxRate = 0.08; // 8% example
  const tax = +(subTotal * taxRate).toFixed(2);
  const grandTotal = +(subTotal + tax).toFixed(2);

  // create order
  const order = {
    orderNumber: makeOrderNumber(),
    userEmail: session.user.email,
    status: "pending" as "pending" | "paid" | "cancelled",
    currency: "USD",
    lines,
    amounts: {
      subTotal,
      tax,
      grandTotal,
      taxRate,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    // you can store pickup/reservation details from req.json() if you like:
    // meta: await req.json().then(v => v).catch(() => undefined),
  };

  const res = await db.collection("orders").insertOne(order);

  // clear cart AFTER order created
  await db.collection("carts").deleteOne({ userEmail: session.user.email });

  return NextResponse.json(
    { id: res.insertedId, orderNumber: order.orderNumber, ...order },
    { status: 201 }
  );
}
