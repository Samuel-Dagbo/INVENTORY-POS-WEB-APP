"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Minus,
  Plus,
  Trash2,
  Percent,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Save,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onApplyDiscount: (discount: number) => void;
  onPaymentModeChange: (mode: string) => void;
  onAmountReceivedChange: (amount: number) => void;
  onCompleteSale: () => void;
  onSaveCart?: () => void;
  paymentMode: string;
  amountReceived: number;
  discount: number;
  subtotal: number;
  total: number;
  isProcessing: boolean;
}

const paymentModes = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "mobile_money", label: "Mobile Money", icon: Smartphone },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyDiscount,
  onPaymentModeChange,
  onAmountReceivedChange,
  onCompleteSale,
  onSaveCart,
  paymentMode,
  amountReceived,
  discount,
  subtotal,
  total,
  isProcessing,
}: CartProps) {
  const [discountInput, setDiscountInput] = useState(discount.toString());
  const [cashAmount, setCashAmount] = useState(amountReceived.toString());

  const handleDiscountSubmit = () => {
    const value = parseFloat(discountInput);
    if (!isNaN(value) && value >= 0) {
      onApplyDiscount(value);
    }
  };

  const handleCashAmountChange = (value: string) => {
    setCashAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onAmountReceivedChange(numValue);
    }
  };

  const change = Math.max(0, amountReceived - total);
  const canComplete = total > 0 && (paymentMode !== "cash" || amountReceived >= total);

  const currentPaymentIcon = paymentModes.find((m) => m.value === paymentMode)?.icon || MoreHorizontal;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
      <div className="px-6 py-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Checkout</h2>
              <p className="text-xs text-indigo-100/80 font-medium">
                {items.length} {items.length === 1 ? "item" : "items"} in cart
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm px-3 py-1 rounded-full font-bold">
              {items.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex gap-3">
          {onSaveCart && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors"
              onClick={onSaveCart}
            >
              <Save className="h-4 w-4 mr-2" />
              Hold
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl"
            disabled
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Recall
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
              onClick={onClearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-inner">
              <ShoppingCart className="h-12 w-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Scan products or search to add them to your order
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.product._id}
                  className={cn(
                    "p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all duration-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-indigo-500/5",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        GH₵{item.unitPrice.toFixed(2)} per unit
                      </p>
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">
                      GH₵{item.subtotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden p-1 shadow-sm">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                      onClick={() => onRemoveItem(item.product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="p-6 space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      GH₵{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-GH₵{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    GH₵{total.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                      Apply Discount (GH₵)
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        onBlur={handleDiscountSubmit}
                        className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 transition-all focus:ring-2 focus:ring-indigo-500/20"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                      Payment Method
                    </label>
                    <Select value={paymentMode} onValueChange={onPaymentModeChange}>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 transition-all focus:ring-2 focus:ring-indigo-500/20">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {paymentModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value} className="rounded-lg">
                            <div className="flex items-center gap-3">
                              <mode.icon className="h-4 w-4 text-slate-500" />
                              <span className="font-medium">{mode.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMode === "cash" && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                          Amount Received (GH₵)
                        </label>
                        <div className="relative">
                          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={cashAmount}
                            onChange={(e) => handleCashAmountChange(e.target.value)}
                            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 transition-all focus:ring-2 focus:ring-indigo-500/20"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      {amountReceived > 0 && (
                        <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Balance to Return</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-400">
                            GH₵{change.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full h-14 text-lg font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white shadow-xl shadow-indigo-500/40 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  disabled={!canComplete || isProcessing}
                  onClick={onCompleteSale}
                >
                  {isProcessing ? (
                    <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {React.createElement(currentPaymentIcon, { className: "h-6 w-6 mr-3" })}
                      Complete Sale
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
