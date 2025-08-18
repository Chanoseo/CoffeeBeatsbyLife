import { NextResponse } from "next/server";
import { mongoClientPromise } from "@/lib/mongodb";
import { z } from "zod";
import nodemailer from "nodemailer";

// Validation schema
const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    // Save message in MongoDB
    const client = await mongoClientPromise;
    const db = client.db();
    const contacts = db.collection("contacts");

    const result = await contacts.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 1) Send notification to admin
    await transporter.sendMail({
      from: `"Coffee Beats Contact" <${process.env.EMAIL_USER}>`,
      to: "hello@coffeebeats.com",
      subject: `📩 New Contact Message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // 2) Auto-reply to user
    await transporter.sendMail({
      from: `"Coffee Beats" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Thanks for contacting Coffee Beats!",
      text: `Hi ${name},\n\nThanks for reaching out! We’ve received your message and will get back to you soon.\n\nBest regards,\nCoffee Beats Team`,
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out to <b>Coffee Beats</b>! ☕</p>
        <p>We’ve received your message and will get back to you as soon as possible.</p>
        <hr/>
        <p><b>Your Message:</b></p>
        <blockquote>${message}</blockquote>
        <p>Best regards,<br/>Coffee Beats Team</p>
      `,
    });

    return NextResponse.json(
      { id: result.insertedId, message: "Message received & emails sent!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
