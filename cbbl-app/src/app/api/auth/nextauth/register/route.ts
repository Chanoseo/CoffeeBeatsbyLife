import { NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, password, role } = parsed.data;

    const client = await mongoClientPromise;
    const db = client.db();
    const users = db.collection("users");

    const exists = await users.findOne({ email });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const passwordHash = await hash(password, 12);

    const result = await users.insertOne({
      email,
      password: passwordHash,
      role: role ?? "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: String(result.insertedId), email }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
