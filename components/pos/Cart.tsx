"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  paymentMode: string;
  amountReceived: number;
  discount: number;
  subtotal: number;
  tax: number;
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
  paymentMode,
  amountReceived,
  discount,
  subtotal,
  tax,
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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800/80">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
              <p className="text-xs text-white/70">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {items.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <Save className="h-4 w-4 mr-1.5" />
            Hold
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Recall
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={onClearCart}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-4">
              <ShoppingCart className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cart is empty
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Start adding products to begin a sale
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item, index) => (
                <div 
                  key={item.product._id} 
                  className={cn(
                    "p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ${item.unitPrice.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-none hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold bg-slate-50 dark:bg-slate-800">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 rounded-none hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      onClick={() => onRemoveItem(item.product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="p-5 space-y-4">
                {/* Subtotal, Discount, Tax */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Separator className="bg-slate-200 dark:bg-slate-700" />

                {/* Total */}
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Discount Input */}
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="Apply discount..."
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    onBlur={handleDiscountSubmit}
                    className="pl-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Payment Method */}
                <Select value={paymentMode} onValueChange={onPaymentModeChange}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center gap-2">
                          <mode.icon className="h-4 w-4 text-slate-500" />
                          {mode.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Cash Amount */}
                {paymentMode === "cash" && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        placeholder="Amount received"
                        value={cashAmount}
                        onChange={(e) => handleCashAmountChange(e.target.value)}
                        className="pl-9 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {amountReceived > 0 && (
                      <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">Change Due</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          ${change.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete Sale Button */}
                <Button
                  className="w-full h-12 text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 shadow-lg shadow-indigo-500/30 rounded-xl transition-all duration-300"
                  disabled={!canComplete || isProcessing}
                  onClick={onCompleteSale}
                >
                  {isProcessing ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {React.createElement(currentPaymentIcon, { className: "h-5 w-5 mr-2" })}
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
