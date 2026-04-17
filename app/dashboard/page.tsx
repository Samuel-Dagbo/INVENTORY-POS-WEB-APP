"use client";

import React, { useState } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  TrendingDown,
  Users,
  BarChart3,
  Target,
  PieChart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CHART_COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("7d");
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  const stats = [
    {
      title: "Today's Sales",
      value: `GH₵${(data?.todaySales?.totalSales || 0).toFixed(2)}`,
      subtitle: `${data?.todaySales?.count || 0} transactions`,
      icon: DollarSign,
      gradient: "emerald" as const,
      change: data?.dailyGrowth || 0,
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
      value: `GH₵${(data?.todaySales?.totalProfit || 0).toFixed(2)}`,
      subtitle: "gross margin",
      icon: TrendingUp,
      gradient: "purple" as const,
      change: data?.profitGrowth || 0,
    },
  ];

  const extendedStats = [
    {
      title: "This Month",
      value: `GH₵${(data?.thisMonthSales?.totalSales || 0).toFixed(2)}`,
      subtitle: `${data?.thisMonthSales?.count || 0} sales`,
      icon: BarChart3,
      gradient: "blue" as const,
      change: data?.salesGrowth || 0,
    },
    {
      title: "Out of Stock",
      value: data?.outOfStockCount || 0,
      subtitle: "products",
      icon: AlertTriangle,
      gradient: "rose" as const,
    },
  ];

  const chartData = (data?.sevenDaySales || []).map((day: { _id: string; total: number; profit: number }) => ({
    date: day._id.split("-").slice(1).join("/"),
    sales: day.total,
    profit: day.profit,
  }));

  const monthlyChartData = (data?.thirtyDaySales || []).map((day: { _id: string; total: number; profit: number }) => ({
    date: day._id.split("-").slice(1).join("/"),
    sales: day.total,
    profit: day.profit,
  }));

  const hourlyChartData = (data?.hourlySales || []).map((h: { hour: string; total: number }) => ({
    hour: h.hour,
    sales: h.total,
  }));

  const categoryChartData = (data?.salesByCategory || []).map((cat: { _id: string; count: number; totalValue: number }) => ({
    category: cat._id,
    products: cat.count,
    value: cat.totalValue,
  }));

  const gradientColors = {
    emerald: { from: "#10b981", to: "#059669" },
    indigo: { from: "#6366f1", to: "#4f46e5" },
    amber: { from: "#f59e0b", to: "#d97706" },
    purple: { from: "#a855f7", to: "#9333ea" },
    blue: { from: "#3b82f6", to: "#2563eb" },
    rose: { from: "#f43f5e", to: "#e11d48" },
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening today."
        actions={
          <Link href="/dashboard/pos">
            <Button className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/25">
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
        }
      />

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
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {stat.subtitle}
                    </p>
                    {stat.change !== undefined && stat.change !== 0 && (
                      <div className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        stat.change > 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {stat.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {extendedStats.map((stat, index) => (
          <Card
            key={stat.title}
            className={cn(
              "relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1",
              "animate-fade-in border border-slate-200/80 dark:border-slate-800/80"
            )}
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
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
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {stat.subtitle}
                    </p>
                    {stat.change !== undefined && stat.change !== 0 && (
                      <div className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        stat.change > 0 ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {stat.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
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

      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "7d" | "14d" | "30d")}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <TabsTrigger value="7d" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">7 Days</TabsTrigger>
          <TabsTrigger value="14d" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">14 Days</TabsTrigger>
          <TabsTrigger value="30d" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">30 Days</TabsTrigger>
        </TabsList>

        <TabsContent value="7d" className="mt-5">
          <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </div>
              </div>
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
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs fill-slate-500" />
                     <YAxis className="text-xs fill-slate-500" tickFormatter={(v) => `GH₵${v}`} />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: "rgba(255, 255, 255, 0.95)",
                         border: "1px solid rgba(226, 232, 240, 0.8)",
                         borderRadius: "12px",
                         boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                       }}
                       formatter={(value: number) => [`GH₵${value.toFixed(2)}`, ""]}
                     />
                     <Area
                       type="monotone"
                       dataKey="sales"
                       stroke="#6366f1"
                       strokeWidth={2.5}
                       fillOpacity={1}
                       fill="url(#colorSales)"
                     />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="14d" className="mt-5">
          <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
              <CardDescription>Last 14 days performance</CardDescription>
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
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs fill-slate-500" />
                     <YAxis className="text-xs fill-slate-500" tickFormatter={(v) => `GH₵${v}`} />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: "rgba(255, 255, 255, 0.95)",
                         border: "1px solid rgba(226, 232, 240, 0.8)",
                         borderRadius: "12px",
                         boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                       }}
                       formatter={(value: number) => [`GH₵${value.toFixed(2)}`, ""]}
                     />
                     <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="30d" className="mt-5">
          <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Sales Overview</CardTitle>
              <CardDescription>Last 30 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : monthlyChartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  No sales data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyChartData}>
                    <defs>
                      <linearGradient id="colorSales30" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="date" className="text-xs fill-slate-500" />
                     <YAxis className="text-xs fill-slate-500" tickFormatter={(v) => `GH₵${v}`} />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: "rgba(255, 255, 255, 0.95)",
                         border: "1px solid rgba(226, 232, 240, 0.8)",
                         borderRadius: "12px",
                         boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                       }}
                       formatter={(value: number) => [`GH₵${value.toFixed(2)}`, ""]}
                     />
                     <Area
                       type="monotone"
                       dataKey="sales"
                       stroke="#6366f1"
                       strokeWidth={2.5}
                       fillOpacity={1}
                       fill="url(#colorSales30)"
                     />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                       GH₵{product.totalRevenue.toFixed(2)}
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
                       <p className="font-semibold text-sm">GH₵{sale.total.toFixed(2)}</p>
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

        <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg font-semibold">Sales by Category</CardTitle>
            </div>
            <CardDescription>Inventory distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : categoryChartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-slate-400">
                No category data
              </div>
            ) : (
              <div className="space-y-3">
                {categoryChartData.slice(0, 6).map((cat: { category: string; products: number; value: number }, index: number) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-slate-500">{cat.products} products</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(cat.products / (data?.salesByCategory?.[0]?.products || 1)) * 100}%`,
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg font-semibold">Top Staff</CardTitle>
            </div>
            <CardDescription>Best performers this week</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.topStaff || []).slice(0, 5).map((staff: { _id: string; name: string; totalSales: number; transactionCount: number }, index: number) => (
                  <div
                    key={staff._id}
                    className="flex items-center justify-between group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : index === 1
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : index === 2
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {(staff.name as string)?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{staff.name as string || "Unknown"}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {staff.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                     <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                       GH₵{(staff.totalSales as number).toFixed(2)}
                     </p>
                  </div>
                ))}
                {(!data?.topStaff || data.topStaff.length === 0) && (
                  <p className="text-center text-slate-400 py-4">No staff data yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(data?.lowStockCount > 0 || data?.outOfStockCount > 0) && (
        <Card className="border-amber-200/50 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Stock Alert
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {data.lowStockCount > 0 && `${data.lowStockCount} product${data.lowStockCount > 1 ? "s" : ""} running low on stock`}
                  {data.lowStockCount > 0 && data.outOfStockCount > 0 && " and "}
                  {data.outOfStockCount > 0 && `${data.outOfStockCount} out of stock`}
                  . Consider restocking soon.
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