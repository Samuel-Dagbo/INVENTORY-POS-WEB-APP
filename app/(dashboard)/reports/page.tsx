"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "recharts";
import { Download, FileText, TrendingUp, DollarSign, Package, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("7");
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  const days = parseInt(dateRange);
  const chartData = (data?.sevenDaySales || []).map((day: { _id: string; total: number; profit: number }) => ({
    date: day._id,
    sales: day.total,
    profit: day.profit,
  }));

  const totalSales = chartData.reduce((sum: number, d: { sales: number }) => sum + d.sales, 0);
  const totalProfit = chartData.reduce((sum: number, d: { profit: number }) => sum + d.profit, 0);
  const avgDaily = chartData.length > 0 ? totalSales / chartData.length : 0;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Analyze your sales performance
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting} className="rounded-xl">
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10">
                    <DollarSign className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Sales
                    </p>
                    <p className="text-2xl font-bold tracking-tight">${totalSales.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Profit
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${totalProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Avg. Daily Sales
                    </p>
                    <p className="text-2xl font-bold tracking-tight">${avgDaily.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Sales & Profit Trend</CardTitle>
              <CardDescription>Daily performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No data available for the selected period</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
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
                    <Legend />
                    <Bar dataKey="sales" fill="#6366f1" radius={[6, 6, 0, 0]} name="Sales" />
                    <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
              <CardDescription>Best performing products by quantity sold</CardDescription>
            </CardHeader>
            <CardContent>
              {(!data?.topProducts || data.topProducts.length === 0) ? (
                <div className="py-8 text-center text-slate-400">
                  <p>No product sales data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topProducts.slice(0, 5).map((product: { _id: string; name: string; totalQuantity: number; totalRevenue: number }, index: number) => (
                    <div key={product._id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={index === 0 ? "h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center justify-center text-sm font-bold" : index === 1 ? "h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-sm font-bold" : index === 2 ? "h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-sm font-bold" : "h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm font-bold"}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {product.totalQuantity} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">${product.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
