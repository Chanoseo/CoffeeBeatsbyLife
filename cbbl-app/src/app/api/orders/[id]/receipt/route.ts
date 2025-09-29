// app/api/orders/[id]/receipt/route.ts
import { PrismaClient } from "@prisma/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// ✅ GET /api/orders/:id/receipt
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> } // wrap params in Promise
) {
  try {
    const { id } = await context.params; // ✅ await before using

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        seat: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- Date and time formatting ---
    const formatDate = (date: Date) =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);

    const formatTime = (date: Date) =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(date);

    // --- PDF Generation ---
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 750]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    let y = height - 50;

    // --- Logo and Business Name ---
    try {
      const logoPath = path.join(process.cwd(), "public", "cbbl-logo.png");
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);

      const logoScale = 0.06;
      const logoDims = logoImage.scale(logoScale);
      const businessText = "Coffee Beats By Life";
      const businessFontSize = 12;
      const businessTextWidth = font.widthOfTextAtSize(
        businessText,
        businessFontSize
      );

      const totalWidth = logoDims.width + 10 + businessTextWidth;
      const startX = (width - totalWidth) / 2;

      page.drawImage(logoImage, {
        x: startX,
        y: y - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });

      page.drawText(businessText, {
        x: startX + logoDims.width + 10,
        y: y - logoDims.height / 2 - businessFontSize / 2,
        size: businessFontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });

      y -= logoDims.height + 40;
    } catch (err) {
      console.error("Logo embedding failed:", err);
    }

    // --- Header ---
    const headerText = "RECEIPT";
    const headerWidth = font.widthOfTextAtSize(headerText, 22);
    page.drawText(headerText, {
      x: (width - headerWidth) / 2,
      y,
      size: 22,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 35;

    // --- Reservation Details ---
    page.drawText("Reservation Details", {
      x: 50,
      y,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    const reservationData: [string, string][] = [
      ["Order ID", order.id],
      ["Date", formatDate(new Date(order.startTime))],
      ["Start Time", formatTime(order.startTime)],
      ["End Time", formatTime(order.endTime)],
      ["Guest", order.guest.toString()],
      ["Seat", order.seat?.name ?? "Not selected"],
      ["Customer", order.user?.name ?? "N/A"],
    ];

    reservationData.forEach(([label, value]) => {
      const valueWidth = font.widthOfTextAtSize(value, 12);
      page.drawText(label + ":", {
        x: 50,
        y,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(value, {
        x: 450 - valueWidth,
        y,
        size: 12,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 16;
    });

    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 450, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 20;

    // --- Ordered Items ---
    page.drawText("Ordered Items", {
      x: 50,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 18;

    order.items.forEach((item) => {
      const sizeText = item.size ? ` ${item.size}` : "";
      const itemLeft = `${item.product.name} (${
        item.quantity
      }${sizeText} x P ${item.price.toFixed(2)})`;
      const lineTotal = `P ${(item.price * item.quantity).toFixed(2)}`;
      const lineTotalWidth = font.widthOfTextAtSize(lineTotal, 12);

      page.drawText(itemLeft, { x: 50, y, size: 12, font });
      page.drawText(lineTotal, { x: 450 - lineTotalWidth, y, size: 12, font });
      y -= 16;
    });

    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 450, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 18;

    // --- Totals Section ---
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const seatCost = 20; // fixed seat tax

    // Subtotal
    const subtotalLabel = "Subtotal:";
    const subtotalAmount = `P ${subtotal.toFixed(2)}`;
    const subtotalAmountWidth = font.widthOfTextAtSize(subtotalAmount, 12);
    page.drawText(subtotalLabel, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(subtotalAmount, {
      x: 450 - subtotalAmountWidth,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 16;

    // Seat Cost
    const seatLabel = "Seat Cost:";
    const seatAmount = `P ${seatCost.toFixed(2)}`;
    const seatAmountWidth = font.widthOfTextAtSize(seatAmount, 12);
    page.drawText(seatLabel, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(seatAmount, {
      x: 450 - seatAmountWidth,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 20;

    // --- Grand Total ---
    const totalLabel = "Total:";
    const totalAmount = `P ${order.totalAmount.toFixed(2)}`;
    const totalAmountWidth = font.widthOfTextAtSize(totalAmount, 14);

    page.drawText(totalLabel, {
      x: 50,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(totalAmount, {
      x: 450 - totalAmountWidth,
      y,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    // --- Footer ---
    const footerText = "Thank you for choosing Coffee Beats By Life!";
    const footerWidth = font.widthOfTextAtSize(footerText, 12);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2,
      y,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
