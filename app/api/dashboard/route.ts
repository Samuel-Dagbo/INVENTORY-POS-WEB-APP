import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Sale } from "@/lib/models/Sale";
import { getUserFromRequest } from "@/lib/auth";
import { startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const fourteenDaysAgo = subDays(today, 14);
    const thirtyDaysAgo = subDays(today, 30);
    const thisMonthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      salesStats,
      recentSales,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
        stockQuantity: { $gt: 0 },
      }),
      Product.countDocuments({ stockQuantity: 0 }),
      Sale.aggregate([
        {
          $facet: {
            today: [
              { $match: { createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) } } },
              { $group: { _id: null, totalSales: { $sum: "$total" }, totalProfit: { $sum: "$profit" }, count: { $sum: 1 } } },
            ],
            sevenDays: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" }, profit: { $sum: "$profit" } } },
              { $sort: { _id: 1 } },
            ],
            fourteenDays: [
              { $match: { createdAt: { $gte: fourteenDaysAgo } } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" } } },
              { $sort: { _id: 1 } },
            ],
            thirtyDays: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$total" }, profit: { $sum: "$profit" } } },
              { $sort: { _id: 1 } },
            ],
            thisMonth: [
              { $match: { createdAt: { $gte: thisMonthStart, $lte: endOfDay(today) } } },
              { $group: { _id: null, totalSales: { $sum: "$total" }, totalProfit: { $sum: "$profit" }, count: { $sum: 1 } } },
            ],
            lastMonth: [
              { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
              { $group: { _id: null, totalSales: { $sum: "$total" }, totalProfit: { $sum: "$profit" }, count: { $sum: 1 } } },
            ],
            hourly: [
              { $match: { createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) } } },
              { $group: { _id: { $hour: "$createdAt" }, total: { $sum: "$total" }, count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Sale.find()
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const todaySales = salesStats[0]?.today || [];
    const sevenDaySales = salesStats[0]?.sevenDays || [];
    const fourteenDaySales = salesStats[0]?.fourteenDays || [];
    const thirtyDaySales = salesStats[0]?.thirtyDays || [];
    const thisMonthSales = salesStats[0]?.thisMonth || [];
    const lastMonthSales = salesStats[0]?.lastMonth || [];
    const hourlySales = salesStats[0]?.hourly || [];

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

    const topStaff = await Sale.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: "$createdBy",
          name: { $first: "$createdBy" },
          totalSales: { $sum: "$total" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]);

    const salesByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stockQuantity" },
          totalValue: {
            $sum: { $multiply: ["$stockQuantity", "$sellingPrice"] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const thisMonthData = thisMonthSales[0] || { totalSales: 0, totalProfit: 0, count: 0 };
    const lastMonthData = lastMonthSales[0] || { totalSales: 0, totalProfit: 0, count: 0 };

    const salesGrowth = lastMonthData.totalSales > 0
      ? ((thisMonthData.totalSales - lastMonthData.totalSales) / lastMonthData.totalSales) * 100
      : 0;

    const profitGrowth = lastMonthData.totalProfit > 0
      ? ((thisMonthData.totalProfit - lastMonthData.totalProfit) / lastMonthData.totalProfit) * 100
      : 0;

    const yesterdaySales = fourteenDaySales.find((day: { _id: string }) =>
      day._id === subDays(today, 1).toISOString().split("T")[0]
    );
    const todayTotal = todaySales[0]?.totalSales || 0;
    const yesterdayTotal = yesterdaySales?.total || 0;
    const dailyGrowth = yesterdayTotal > 0 ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100 : 0;

    const dashboardData = {
      totalProducts,
      lowStockCount: lowStockProducts,
      outOfStockCount: outOfStockProducts,
      todaySales: todaySales[0] || { totalSales: 0, totalProfit: 0, count: 0 },
      sevenDaySales,
      topProducts,
      recentSales,
      thisMonthSales: thisMonthData,
      lastMonthSales: lastMonthData,
      salesGrowth: parseFloat(salesGrowth.toFixed(1)),
      profitGrowth: parseFloat(profitGrowth.toFixed(1)),
      dailyGrowth: parseFloat(dailyGrowth.toFixed(1)),
      hourlySales: hourlySales.map((h: { _id: number; total: number; count: number }) => ({
        hour: `${h._id}:00`,
        total: h.total,
        count: h.count,
      })),
      topStaff,
      salesByCategory,
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
