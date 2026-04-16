"use client";

import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { Cart, CartItem } from "@/components/pos/Cart";
import { BarcodeScanner } from "@/components/pos/BarcodeScanner";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, Search, CheckCircle2 } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LastSale {
  invoiceNumber: string;
  total: number;
  paymentMode: string;
  change: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function POSPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [amountReceived, setAmountReceived] = useState(0);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  const { data, mutate } = useSWR<{ products: Product[] }>("/api/products?limit=100", fetcher);

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = 0;
  const total = Math.max(0, subtotal - discount);

  const findProductByBarcode = useCallback(
    (barcode: string): Product | undefined => {
      return data?.products?.find((p) => p.barcode === barcode);
    },
    [data]
  );

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stockQuantity),
                subtotal: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          unitPrice: product.sellingPrice,
          subtotal: product.sellingPrice * quantity,
          discount: 0,
        },
      ];
    });
  }, []);

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = findProductByBarcode(barcode);
      if (product) {
        addToCart(product, 1);
      } else {
        alert(`Product with barcode "${barcode}" not found`);
      }
    },
    [findProductByBarcode, addToCart]
  );

  const handleSearchSelect = useCallback(
    (product: Product) => {
      addToCart(product, 1);
      setIsSearchOpen(false);
    },
    [addToCart]
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product._id === productId
            ? { ...item, quantity, subtotal: item.unitPrice * quantity }
            : item
        )
      );
    }
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(0);
    setAmountReceived(0);
  }, []);

  const handleApplyDiscount = useCallback((value: number) => {
    setDiscount(Math.min(value, subtotal));
  }, [subtotal]);

  const completeSale = useCallback(async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      const saleData = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          SKU: item.product.SKU,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.product.costPrice,
          subtotal: item.subtotal,
        })),
        subtotal,
        tax,
        discount,
        total,
        paymentMode,
        amountReceived,
        change: Math.max(0, amountReceived - total),
      };

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to complete sale");
      }

      const sale = await res.json();
      setLastSale(sale);
      setShowReceipt(true);
      clearCart();
      mutate();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to complete sale");
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, subtotal, tax, discount, total, paymentMode, amountReceived, clearCart, mutate]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Point of Sale"
        description="Process sales and manage transactions"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsScannerOpen(true)}
              className="hidden sm:flex h-10 rounded-xl"
            >
              <ScanBarcode className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex h-10 rounded-xl"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {cartItems.length > 0 && (
              <Badge variant="default" size="lg" className="px-3 py-1.5">
                {cartItems.length} items
              </Badge>
            )}
          </div>
        }
      />

      <div className="flex sm:hidden gap-2">
        <Button
          variant="outline"
          onClick={() => setIsScannerOpen(true)}
          className="flex-1 h-11 rounded-xl"
        >
          <ScanBarcode className="h-4 w-4 mr-2" />
          Scan Barcode
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 h-11 rounded-xl"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-auto">
            <ProductGrid onAddToCart={addToCart} />
          </div>
        </div>

        <div className="lg:w-80 xl:w-96 shrink-0 lg:sticky lg:top-4 lg:self-start">
          <div className="lg:bg-white lg:dark:bg-slate-900 lg:rounded-2xl lg:border lg:border-slate-200/80 dark:lg:border-slate-800/80 lg:p-0 lg:shadow-xl">
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              onApplyDiscount={handleApplyDiscount}
              onPaymentModeChange={setPaymentMode}
              onAmountReceivedChange={setAmountReceived}
              onCompleteSale={completeSale}
              paymentMode={paymentMode}
              amountReceived={amountReceived}
              discount={discount}
              subtotal={subtotal}
              tax={tax}
              total={total}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-500" />
              Search Products
            </DialogTitle>
            <DialogDescription>
              Find products by name, SKU, or barcode
            </DialogDescription>
          </DialogHeader>
          <ProductSearch onSelect={handleSearchSelect} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Sale Completed!
            </DialogTitle>
            <DialogDescription>
              Transaction was successful
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Invoice</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {lastSale?.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total</span>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  ${(lastSale?.total as number)?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment Method</span>
                <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                  {(lastSale?.paymentMode as string)?.replace("_", " ")}
                </span>
              </div>
              {(lastSale?.change as number) > 0 && (
                <div className="flex justify-between text-sm bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg -mx-1">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Change Due</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    ${(lastSale?.change as number)?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <Button className="w-full" size="lg" onClick={() => setShowReceipt(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}