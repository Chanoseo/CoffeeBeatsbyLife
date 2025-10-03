import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function calcGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function GET() {
  try {
    const now = new Date();

    // Dates
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ✅ Overall totals
    const totalOrders = await prisma.order.count({
      where: { status: { not: "Cancelled" } },
    });
    const totalReservations = await prisma.order.count({
      where: { status: { not: "Cancelled" } },
    });
    const totalRevenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "Completed" },
    });
    const totalRevenue = Number(totalRevenueAgg._sum.totalAmount || 0);

    // ✅ This month (Oct)
    const thisMonthOrders = await prisma.order.count({
      where: {
        status: { not: "Cancelled" },
        createdAt: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
    });
    const thisMonthReservations = await prisma.order.count({
      where: {
        status: { not: "Cancelled" },
        startTime: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
    });
    const thisMonthRevenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "Completed",
        createdAt: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
    });
    const thisMonthRevenue = Number(thisMonthRevenueAgg._sum.totalAmount || 0);

    // ✅ Last month (Sep)
    const lastMonthOrders = await prisma.order.count({
      where: {
        status: { not: "Cancelled" },
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    });
    const lastMonthReservations = await prisma.order.count({
      where: {
        status: { not: "Cancelled" },
        startTime: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    });
    const lastMonthRevenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "Completed",
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    });
    const lastMonthRevenue = Number(lastMonthRevenueAgg._sum.totalAmount || 0);

    // ✅ Ratings
    const ratings = await prisma.rating.findMany({ select: { rating: true } });
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    // ✅ Response
    return NextResponse.json({
      totalOrders,
      totalRevenue,
      reservationCount: totalReservations,
      avgRating: Number(avgRating.toFixed(1)),
      reviewsCount: ratings.length,
      growth: {
        orders: calcGrowth(thisMonthOrders, lastMonthOrders),
        revenue: calcGrowth(thisMonthRevenue, lastMonthRevenue),
        reservations: calcGrowth(thisMonthReservations, lastMonthReservations),
      },
    });
  } catch (error) {
    console.error("Error fetching key metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch key metrics" },
      { status: 500 }
    );
  }
}
