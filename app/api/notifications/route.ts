import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { Sale } from "@/lib/models/Sale";
import { getUserFromRequest } from "@/lib/auth";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);

    const [lowStockProducts, outOfStockProducts, todaySales] = await Promise.all([
      Product.find({
        $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] },
        stockQuantity: { $gt: 0 },
      })
        .select("name stockQuantity lowStockThreshold")
        .sort({ stockQuantity: 1 })
        .limit(10),
      Product.find({ stockQuantity: 0 })
        .select("name")
        .sort({ name: 1 })
        .limit(10),
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
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    const notifications = [];

    if (outOfStockProducts.length > 0) {
      notifications.push({
        id: "out_of_stock",
        type: "critical",
        title: "Out of Stock",
        message: `${outOfStockProducts.length} product${outOfStockProducts.length > 1 ? "s" : ""} out of stock`,
        data: outOfStockProducts.map((p) => ({
          id: p._id,
          name: p.name,
        })),
        createdAt: new Date().toISOString(),
      });
    }

    if (lowStockProducts.length > 0) {
      notifications.push({
        id: "low_stock",
        type: "warning",
        title: "Low Stock Alert",
        message: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? "s" : ""} running low`,
        data: lowStockProducts.map((p) => ({
          id: p._id,
          name: p.name,
          stock: p.stockQuantity,
          threshold: p.lowStockThreshold,
        })),
        createdAt: new Date().toISOString(),
      });
    }

    const todaySalesData = todaySales[0];
    if (todaySalesData && todaySalesData.count > 0) {
      notifications.push({
        id: "today_sales",
        type: "success",
        title: "Today's Sales",
          message: `${todaySalesData.count} sales totaling GH₵${todaySalesData.total.toFixed(2)}`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}