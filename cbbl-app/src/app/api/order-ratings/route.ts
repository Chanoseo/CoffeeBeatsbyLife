import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ✅ Check if already rated
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "Missing orderId" },
      { status: 400 }
    );
  }

  const existingFeedback = await prisma.orderFeedback.findUnique({
    where: {
      orderId_userId: {
        orderId,
        userId: session.user.id,
      },
    },
  });

  return NextResponse.json({ success: true, alreadyRated: !!existingFeedback });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { orderId, ratings, reviews, categories } = await req.json();

    if (!orderId || !ratings) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    // ✅ Save product ratings
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: { product: true },
    });

    for (const item of orderItems) {
      const productRating = ratings[item.product.id]; // e.g., { productId: 5 }
      if (productRating) {
        await prisma.rating.upsert({
          where: {
            orderItemId_userId: { orderItemId: item.id, userId }, // unique constraint
          },
          update: {
            rating: productRating,
            review: reviews?.[item.product.id] || null,
          },
          create: {
            orderId,
            orderItemId: item.id,
            productId: item.product.id,
            userId,
            rating: productRating,
            review: reviews?.[item.product.id] || null,
          },
        });
      }
    }

    // ✅ Save overall order feedback
    if (categories && Object.keys(categories).length > 0) {
      await prisma.orderFeedback.upsert({
        where: {
          orderId_userId: { orderId, userId }, // unique per order/user
        },
        update: {
          appExperience: categories["App Experience"] || 0,
          orderCompleteness: categories["Order Completeness"] || 0,
          speedOfService: categories["Speed of Service"] || 0,
          valueForMoney: categories["Value for money"] || 0,
          reservationExperience: categories["Reservation Experience"] || 0,
          overallSatisfaction: categories["Overall Satisfaction"] || 0,
          overallReview: reviews?.overall || null,
        },
        create: {
          orderId,
          userId,
          appExperience: categories["App Experience"] || 0,
          orderCompleteness: categories["Order Completeness"] || 0,
          speedOfService: categories["Speed of Service"] || 0,
          valueForMoney: categories["Value for money"] || 0,
          reservationExperience: categories["Reservation Experience"] || 0,
          overallSatisfaction: categories["Overall Satisfaction"] || 0,
          overallReview: reviews?.overall || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving ratings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
