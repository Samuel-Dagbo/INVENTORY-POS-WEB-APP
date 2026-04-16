"use client";

import React from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  const stats = [
    {
      title: "Today's Sales",
      value: `$${(data?.todaySales?.totalSales || 0).toFixed(2)}`,
      subtitle: `${data?.todaySales?.count || 0} transactions`,
      icon: DollarSign,
      gradient: "emerald" as const,
    },
    {
      title: "Total Products",
      value: data?.totalProducts || 0,
      subtitle: "in inventory",
      icon: Package,
      gradient: "indigo" as const,
    },
    {
      title: "Low Stock Items",
      value: data?.lowStockCount || 0,
      subtitle: "need attention",
      icon: AlertTriangle,
      gradient: "amber" as const,
    },
    {
      title: "Today's Profit",
      value: `$${(data?.todaySales?.totalProfit || 0).toFixed(2)}`,
      subtitle: "gross margin",
      icon: TrendingUp,
      gradient: "purple" as const,
    },
  ];

  const chartData = (data?.sevenDaySales || []).map((day: { _id: string; total: number; profit: number }) => ({
    date: day._id,
    sales: day.total,
    profit: day.profit,
  }));

  const gradientColors = {
    emerald: { from: "#10b981", to: "#059669" },
    indigo: { from: "#6366f1", to: "#4f46e5" },
    amber: { from: "#f59e0b", to: "#d97706" },
    purple: { from: "#a855f7", to: "#9333ea" },
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos">
            <Button className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/25">
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className={cn(
              "relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1",
              "animate-fade-in border border-slate-200/80 dark:border-slate-800/80"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {stat.subtitle}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
                    `from-${gradientColors[stat.gradient].from} to-${gradientColors[stat.gradient].to}`
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${gradientColors[stat.gradient].from}, ${gradientColors[stat.gradient].to})`,
                  }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
            <div
              className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5"
              style={{
                background: `linear-gradient(90deg, ${gradientColors[stat.gradient].from}, ${gradientColors[stat.gradient].to})`,
              }}
            />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="date" className="text-xs fill-slate-500" />
                  <YAxis className="text-xs fill-slate-500" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
            <CardDescription>Best sellers this week</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.topProducts || []).slice(0, 5).map((product: { _id: string; name: string; totalQuantity: number; totalRevenue: number }, index: number) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : index === 1
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : index === 2
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {product.totalQuantity} sold
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                      ${product.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                ))}
                {(!data?.topProducts || data.topProducts.length === 0) && (
                  <p className="text-center text-slate-400 py-4">No product sales yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.recentSales || []).map((sale: { _id: string; invoiceNumber: string; total: number; createdAt: string; createdBy: { name: string } }, index: number) => (
                  <div
                    key={sale._id}
                    className="flex items-center justify-between group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div>
                      <p className="font-medium text-sm">{sale.invoiceNumber}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${sale.total.toFixed(2)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {sale.createdBy?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
                {(!data?.recentSales || data.recentSales.length === 0) && (
                  <p className="text-center text-slate-400 py-4">No recent sales</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data?.lowStockCount > 0 && (
        <Card className="border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {data.lowStockCount} product{data.lowStockCount > 1 ? "s" : ""} running low on stock.
                  Consider restocking soon.
                </p>
              </div>
              <Link href="/dashboard/inventory">
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20 rounded-xl"
                >
                  View Inventory
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}