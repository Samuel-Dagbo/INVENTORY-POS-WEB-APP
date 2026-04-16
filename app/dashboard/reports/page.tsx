"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("7");
  const [isExporting, setIsExporting] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "area" | "line">("bar");

  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  const days = parseInt(dateRange);
  const chartData = (data?.sevenDaySales || []).map((day: { _id: string; total: number; profit: number }) => ({
    date: new Date(day._id).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    sales: day.total,
    profit: day.profit,
  }));

  const totalSales = chartData.reduce((sum: number, d: { sales: number }) => sum + d.sales, 0);
  const totalProfit = chartData.reduce((sum: number, d: { profit: number }) => sum + d.profit, 0);
  const avgDaily = chartData.length > 0 ? totalSales / chartData.length : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csv = [
        ["Date", "Sales", "Profit"],
        ...chartData.map((d: { date: string; sales: number; profit: number }) => [d.date, d.sales, d.profit]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      setIsExporting(false);
    }, 1000);
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
    };

    if (chartType === "area") {
      return (
        <AreaChart {...commonProps}>
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
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === "sales" ? "Sales" : "Profit"]}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
          />
          <Legend />
          <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fill="url(#colorSales)" name="Sales" />
          <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fill="url(#colorProfit)" name="Profit" />
        </AreaChart>
      );
    }

    if (chartType === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === "sales" ? "Sales" : "Profit"]}
            labelStyle={{ color: "#1e293b", fontWeight: 600 }}
          />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} name="Sales" />
          <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} name="Profit" />
        </LineChart>
      );
    }

    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
        <XAxis dataKey="date" className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis className="text-xs" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === "sales" ? "Sales" : "Profit"]}
          labelStyle={{ color: "#1e293b", fontWeight: 600 }}
        />
        <Legend />
        <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Sales" />
        <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="Profit" />
      </BarChart>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Analyze your sales performance and trends"
        actions={
          <Button variant="outline" onClick={handleExport} disabled={isExporting} className="rounded-xl">
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
        }
      />

      {/* Date Range & Chart Type */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44 h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(["bar", "area", "line"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                chartType === type
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading reports...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stagger-item">
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Total Sales
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        ${totalSales.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          +12.5%
                        </span>
                        <span className="text-xs text-slate-400">vs last period</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Total Profit
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        ${totalProfit.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          +8.2%
                        </span>
                        <span className="text-xs text-slate-400">vs last period</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Avg. Daily Sales
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        ${avgDaily.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          +5.1%
                        </span>
                        <span className="text-xs text-slate-400">vs last period</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Receipt className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="stagger-item">
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Profit Margin
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {profitMargin.toFixed(1)}%
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          Healthy margin
                        </span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Sales & Profit Trend</CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Daily performance over the selected period
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-[350px] flex flex-col items-center justify-center text-slate-400">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No data available</p>
                  <p className="text-sm text-slate-400 mt-1">Make some sales to see your analytics</p>
                </div>
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Top Performing Products</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Best sellers by quantity and revenue
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {(!data?.topProducts || data.topProducts.length === 0) ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-slate-600 dark:text-slate-300">No product data available</p>
                  <p className="text-sm mt-1">Start selling to see top products here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.topProducts.slice(0, 5).map((product: { _id: string; name: string; totalQuantity: number; totalRevenue: number }, index: number) => {
                    const medals = ["text-amber-500", "text-slate-400", "text-orange-400"];
                    const medalBg = [
                      "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
                      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
                      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
                    ];
                    
                    return (
                      <div 
                        key={product._id} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                          "animate-fade-in"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold",
                            index < 3 ? medalBg[index] : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          )}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {product.totalQuantity} units sold
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ${product.totalRevenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">revenue</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
