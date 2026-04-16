"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface SaleItem {
  quantity: number;
  name: string;
  subtotal: number;
}

interface SaleData {
  _id: string;
  invoiceNumber: string;
  items: SaleItem[];
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  paymentMode: string;
  amountReceived: number;
  change: number;
  profit: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);

  const { data, isLoading } = useSWR<{
    sales: SaleData[];
    total: number;
    totalPages: number;
  }>(
    `/api/sales?page=${page}&limit=20${dateFrom ? `&dateFrom=${dateFrom}` : ""}${dateTo ? `&dateTo=${dateTo}` : ""}`,
    fetcher
  );

  const paymentModeLabels: Record<string, string> = {
    cash: "Cash",
    card: "Card",
    mobile_money: "Mobile Money",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          View and manage your sales transactions
        </p>
      </div>

      <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search by invoice number..." className="pl-10 rounded-xl bg-slate-50 dark:bg-slate-800/50" />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto rounded-xl"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !data?.sales || data.sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <FileText className="h-14 w-14 mb-4 opacity-30" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No sales found</p>
              <p className="text-sm mt-1">Sales will appear here once you make your first sale</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Invoice</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Date</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Items</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Total</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Payment</th>
                      <th className="text-left py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Profit</th>
                      <th className="text-right py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.map((sale) => (
                      <tr key={sale._id} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {sale.invoiceNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(sale.createdAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary" className="rounded-md">
                            {sale.items.length} items
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          ${sale.total.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="rounded-md">
                            {paymentModeLabels[sale.paymentMode] || "Unknown"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                          ${sale.profit.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSale(sale)}
                            className="rounded-lg"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.total)} of {data.total} sales
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.totalPages}
                    className="rounded-xl"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              Invoice {selectedSale?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{format(new Date(selectedSale.createdAt), "PPpp")}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Items</h4>
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${selectedSale.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-indigo-600">${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="outline">
                    {paymentModeLabels[selectedSale.paymentMode]}
                  </Badge>
                </div>
                {selectedSale.paymentMode === "cash" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Received</span>
                      <span>${selectedSale.amountReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-medium">${selectedSale.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm text-emerald-600">
                  <span className="text-muted-foreground">Profit</span>
                  <span className="font-medium">${selectedSale.profit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
