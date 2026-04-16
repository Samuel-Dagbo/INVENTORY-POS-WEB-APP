import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Sale } from "@/lib/models/Sale";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    const [
      totalProducts,
      lowStockProducts,
      todaySales,
      sevenDaySales,
      recentSales,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
      }),
      Sale.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfDay(today),
              $lte: endOfDay(today),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
            totalProfit: { $sum: "$profit" },
            count: { $sum: 1 },
          },
        },
      ]),
      Sale.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            total: { $sum: "$total" },
            profit: { $sum: "$profit" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Sale.find()
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    const dashboardData = {
      totalProducts,
      lowStockCount: lowStockProducts,
      todaySales: todaySales[0] || { totalSales: 0, totalProfit: 0, count: 0 },
      sevenDaySales,
      topProducts,
      recentSales,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
