import { NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { hash } from "bcryptjs";
import { z } from "zod";

// Validation schema
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "admin"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, role } = parsed.data;

    // Connect to DB
    const client = await mongoClientPromise;
    const db = client.db();
    const users = db.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Insert new user
    const result = await users.insertOne({
      email,
      password: passwordHash,
      role: role ?? "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { id: String(result.insertedId), email },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
