"use client";

import React, { useState, useCallback } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { Cart, CartItem } from "@/components/pos/Cart";
import { BarcodeScanner } from "@/components/pos/BarcodeScanner";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, ScanBarcode, Search } from "lucide-react";
import { Product } from "@/lib/types";

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
          sku: item.product.SKU,
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
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            variant="outline"
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 sm:flex-none h-11 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ScanBarcode className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 sm:flex-none h-11 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Search className="h-4 w-4 mr-2" />
            Search Products
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <ProductGrid onAddToCart={addToCart} />
        </div>
      </div>

      <div className="w-full lg:w-96 shrink-0">
        <div className="sticky top-4">
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

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScan}
      />

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Products</DialogTitle>
            <DialogDescription>
              Find products by name, SKU, or barcode
            </DialogDescription>
          </DialogHeader>
          <ProductSearch onSelect={handleSearchSelect} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-emerald-600">
              Sale Completed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Transaction successful
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invoice</span>
                <span className="font-mono font-medium">{lastSale?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-bold">${(lastSale?.total as number)?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment</span>
                <span className="capitalize">{lastSale?.paymentMode as string}</span>
              </div>
              {(lastSale?.change as number) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Change</span>
                  <span className="font-semibold">${(lastSale?.change as number)?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => setShowReceipt(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}