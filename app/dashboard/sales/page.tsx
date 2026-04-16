"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
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
import { 
  Search, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const paymentModeConfig: Record<string, { label: string; icon: typeof CreditCard; variant: "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "pink" | "info" }> = {
  cash: { label: "Cash", icon: Banknote, variant: "success" as const },
  card: { label: "Card", icon: CreditCard, variant: "default" as const },
  mobile_money: { label: "Mobile Money", icon: Smartphone, variant: "info" as const },
  other: { label: "Other", icon: TrendingUp, variant: "secondary" as const },
};

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useSWR<{
    sales: SaleData[];
    total: number;
    totalPages: number;
  }>(
    `/api/sales?page=${page}&limit=20${dateFrom ? `&dateFrom=${dateFrom}` : ""}${dateTo ? `&dateTo=${dateTo}` : ""}`,
    fetcher
  );

  const filteredSales = (data?.sales || []).filter((sale) =>
    sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Sales History"
        description="View and manage all your sales transactions"
      />

      {/* Filters */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-auto h-11 text-sm"
                />
                <span className="text-slate-400">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-auto h-11 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Loading sales...</p>
            </div>
          </CardContent>
        ) : !filteredSales || filteredSales.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-6">
              <Receipt className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No sales found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
              {searchQuery || dateFrom || dateTo
                ? "Try adjusting your filters or search terms"
                : "Sales will appear here once you make your first sale"}
            </p>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="text-right py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSales.map((sale, index) => {
                    const paymentConfig = paymentModeConfig[sale.paymentMode] || paymentModeConfig.other;
                    const PaymentIcon = paymentConfig.icon;
                    
                    return (
                      <tr 
                        key={sale._id} 
                        className={cn(
                          "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer",
                          "animate-fade-in"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => setSelectedSale(sale)}
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            {sale.invoiceNumber}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(sale.createdAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="rounded-lg">
                            {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          ${sale.total.toFixed(2)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <PaymentIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {paymentConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            +${sale.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSale(sale);
                            }}
                            className="rounded-lg text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold">{(page - 1) * 20 + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(page * 20, data?.total || 0)}</span> of{" "}
                <span className="font-semibold">{data?.total || 0}</span> sales
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
                  disabled={page >= (data?.totalPages || 1)}
                  className="rounded-xl"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-2xl">Sale Details</DialogTitle>
            <DialogDescription className="text-center">
              Invoice <span className="font-mono font-semibold">{selectedSale?.invoiceNumber}</span>
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {format(new Date(selectedSale.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </div>
              
              <Separator className="bg-slate-200 dark:bg-slate-700" />
              
              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Items Purchased
                </h4>
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} × ${(item.subtotal / item.quantity).toFixed(2)}</p>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              <Separator className="bg-slate-200 dark:bg-slate-700" />
              
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="text-slate-700 dark:text-slate-300">${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-medium">-${selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="text-slate-700 dark:text-slate-300">${selectedSale.tax.toFixed(2)}</span>
                </div>
                <Separator className="bg-slate-200 dark:bg-slate-700" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${selectedSale.total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <Separator className="bg-slate-200 dark:bg-slate-700" />
              
              {/* Payment Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Payment Method</span>
                  <Badge variant="secondary" className="rounded-lg">
                    {paymentModeConfig[selectedSale.paymentMode]?.label || "Unknown"}
                  </Badge>
                </div>
                {selectedSale.paymentMode === "cash" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Amount Received</span>
                      <span className="text-slate-700 dark:text-slate-300">${selectedSale.amountReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg -mx-1">
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Change Due</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">${selectedSale.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">Profit</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    +${selectedSale.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
