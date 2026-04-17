"use client";

import React, { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { Cart, CartItem } from "@/components/pos/Cart";
import { BarcodeScanner } from "@/components/pos/BarcodeScanner";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, Search, CheckCircle2, RotateCcw, Save, X, Keyboard, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedCart {
  id: string;
  name: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  savedAt: Date;
}

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
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [showSavedCarts, setShowSavedCarts] = useState(false);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const { data, mutate } = useSWR<{ products: Product[] }>("/api/products?limit=100", fetcher);

  useEffect(() => {
    const saved = localStorage.getItem("pos_saved_carts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedCarts(parsed.map((c: SavedCart) => ({
          ...c,
          savedAt: new Date(c.savedAt)
        })));
      } catch (e) {}
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
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
    toast.success(`${product.name} added`, {
      icon: <ShoppingCart className="h-4 w-4" />,
      duration: 1000,
    });
  }, []);

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      const product = findProductByBarcode(barcode);
      if (product) {
        addToCart(product, 1);
      } else {
        toast.error(`Product not found: ${barcode}`);
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

  const saveCart = useCallback(() => {
    if (cartItems.length === 0) return;

    const cartName = `Cart ${new Date().toLocaleTimeString()}`;
    const newCart: SavedCart = {
      id: Date.now().toString(),
      name: cartName,
      items: cartItems,
      subtotal,
      total,
      savedAt: new Date(),
    };

    const updatedCarts = [newCart, ...savedCarts].slice(0, 5);
    setSavedCarts(updatedCarts);
    localStorage.setItem("pos_saved_carts", JSON.stringify(updatedCarts));

    clearCart();
    toast.info("Cart placed on hold");
  }, [cartItems, subtotal, total, savedCarts, clearCart]);

  const recallCart = useCallback((cartId: string) => {
    const cart = savedCarts.find((c) => c.id === cartId);
    if (cart) {
      setCartItems(cart.items);
      setDiscount(0);
      setAmountReceived(0);
      setShowSavedCarts(false);
      toast.success("Cart recalled successfully");
    }
  }, [savedCarts]);

  const deleteSavedCart = useCallback((cartId: string) => {
    const updatedCarts = savedCarts.filter((c) => c.id !== cartId);
    setSavedCarts(updatedCarts);
    localStorage.setItem("pos_saved_carts", JSON.stringify(updatedCarts));
  }, [savedCarts]);

  const completeSale = useCallback(async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      const saleData = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: item.product.costPrice,
          subtotal: item.subtotal,
        })),
        subtotal,
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
      setShowMobileCart(false);
      clearCart();
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete sale");
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, subtotal, discount, total, paymentMode, amountReceived, clearCart, mutate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && e.ctrlKey) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "b" && e.ctrlKey) {
        e.preventDefault();
        setIsScannerOpen(true);
      }
      if (e.key === "Escape") {
        if (showSavedCarts) setShowSavedCarts(false);
        if (isSearchOpen) setIsSearchOpen(false);
        if (isScannerOpen) setIsScannerOpen(false);
        if (showMobileCart) setShowMobileCart(false);
      }
      if (e.key === "F10") {
        e.preventDefault();
        if (cartItems.length > 0) completeSale();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSavedCarts, isSearchOpen, isScannerOpen, showMobileCart, cartItems, completeSale]);

  return (
    <div className="h-full flex flex-col p-4 lg:p-6 space-y-6 overflow-hidden">
      <PageHeader
        title="Point of Sale"
        description="High-speed transaction terminal"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setKeyboardHelpOpen(true)}
              className="hidden sm:flex h-10 rounded-xl input-premium transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Shortcuts
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSavedCarts(true)}
              className="hidden sm:flex h-10 rounded-xl input-premium transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Hold/Recall ({savedCarts.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsScannerOpen(true)}
              className="hidden md:flex h-10 rounded-xl input-premium transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <ScanBarcode className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex h-10 rounded-xl input-premium transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        }
      />
 
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Main Product Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="overflow-y-auto pr-2 custom-scrollbar">
            <ProductGrid onAddToCart={addToCart} />
          </div>
        </div>
 
        {/* Desktop Persistent Cart */}
        <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col h-full">
          <div className="h-full card-premium shadow-glow-lg overflow-hidden flex flex-col border-slate-200/50 dark:border-slate-800/50">
            <Cart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
              onApplyDiscount={handleApplyDiscount}
              onPaymentModeChange={setPaymentMode}
              onAmountReceivedChange={setAmountReceived}
              onCompleteSale={completeSale}
              onSaveCart={saveCart}
              paymentMode={paymentMode}
              amountReceived={amountReceived}
              discount={discount}
              subtotal={subtotal}
              total={total}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </div>

       {/* Mobile Floating Cart Button */}
       <div className="lg:hidden fixed bottom-6 right-6 z-50">
         <Button
           onClick={() => setShowMobileCart(true)}
           className={cn(
             "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center active:scale-90",
             cartItems.length > 0 
               ? "bg-gradient-primary hover:bg-gradient-primary-hover text-white scale-110 shadow-indigo-500/40" 
               : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-lg"
           )}
         >
           <div className="relative">
             <ShoppingCart className="h-6 w-6" />
             {cartItems.length > 0 && (
               <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white text-[10px] border-0 shadow-lg">
                 {cartItems.length}
               </Badge>
             )}
           </div>
         </Button>
       </div>
 
       {/* Mobile Cart Modal */}
       <Dialog open={showMobileCart} onOpenChange={setShowMobileCart}>
         <DialogContent className="max-w-2xl h-full max-h-[90vh] overflow-hidden p-0 rounded-t-3xl lg:hidden border-slate-200 dark:border-slate-800">
           <div className="h-full overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
             <DialogHeader className="mb-6">
               <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                 <ShoppingCart className="h-6 w-6 text-indigo-500" />
                 Order Summary
               </DialogTitle>
               <DialogDescription className="text-slate-500 dark:text-slate-400">
                 Review your items and complete the transaction
               </DialogDescription>
             </DialogHeader>
             <div className="card-premium shadow-lg border-slate-200/50 dark:border-slate-800/50 overflow-hidden rounded-3xl">
               <Cart
                 items={cartItems}
                 onUpdateQuantity={updateQuantity}
                 onRemoveItem={removeItem}
                 onClearCart={clearCart}
                 onApplyDiscount={handleApplyDiscount}
                 onPaymentModeChange={setPaymentMode}
                 onAmountReceivedChange={setAmountReceived}
                 onCompleteSale={completeSale}
                 onSaveCart={saveCart}
                 paymentMode={paymentMode}
                 amountReceived={amountReceived}
                 discount={discount}
                 subtotal={subtotal}
                 total={total}
                 isProcessing={isProcessing}
               />
             </div>
           </div>
         </DialogContent>
       </Dialog>

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
         <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800">
           <DialogHeader className="text-center">
             <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-scale-in">
               <CheckCircle2 className="h-10 w-10 text-white" />
             </div>
             <DialogTitle className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
               Sale Completed!
             </DialogTitle>
             <DialogDescription className="text-slate-500 dark:text-slate-400 text-lg">
               Transaction was successful
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-6 py-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Invoice</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {lastSale?.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Total</span>
                    <span className="font-black text-2xl text-slate-900 dark:text-white">
                      GH₵{(lastSale?.total as number)?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">Payment Method</span>
                    <span className="capitalize font-bold text-slate-700 dark:text-slate-300">
                      {(lastSale?.paymentMode as string)?.replace("_", " ")}
                    </span>
                  </div>
                  {(lastSale?.change as number) > 0 && (
                    <div className="flex justify-between items-center bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Change Due</span>
                      <span className="font-black text-xl text-emerald-700 dark:text-emerald-400">
                        GH₵{(lastSale?.change as number)?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg shadow-indigo-500/30 transition-all duration-300 active:scale-95" size="lg" onClick={() => setShowReceipt(false)}>
                  Done
                </Button>
            </div>
          </DialogContent>
        </Dialog>

       <Dialog open={showSavedCarts} onOpenChange={setShowSavedCarts}>
         <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800">
           <DialogHeader>
             <DialogTitle className="text-2xl font-bold flex items-center gap-2">
               <RotateCcw className="h-6 w-6 text-indigo-500" />
               Saved Carts
             </DialogTitle>
             <DialogDescription className="text-slate-500 dark:text-slate-400">
               Recall a previously saved cart
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-3 max-h-80 overflow-y-auto py-4 custom-scrollbar">
             {savedCarts.length === 0 ? (
               <div className="text-center py-12 text-slate-500">
                 <RotateCcw className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                 <p className="text-lg font-medium">No saved carts</p>
                 <p className="text-sm">Save your current cart to recall it later</p>
               </div>
             ) : (
               savedCarts.map((cart) => (
                 <div
                   key={cart.id}
                   className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 group card-premium"
                 >
                   <div className="flex items-center justify-between mb-3">
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white">{cart.name}</p>
                       <p className="text-xs text-slate-500">
                         {cart.items.length} items • {new Date(cart.savedAt).toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <Button
                         size="sm"
                         onClick={() => recallCart(cart.id)}
                         className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 active:scale-95"
                       >
                         Recall
                       </Button>
                       <Button
                         size="icon-sm"
                         variant="ghost"
                         onClick={() => deleteSavedCart(cart.id)}
                         className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                       >
                         <X className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                     {cart.items.slice(0, 3).map((item) => (
                       <Badge key={item.product._id} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                         {item.product.name} x{item.quantity}
                       </Badge>
                     ))}
                     {cart.items.length > 3 && (
                       <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none">
                         +{cart.items.length - 3} more
                       </Badge>
                     )}
                   </div>
                 </div>
               ))
             )}
           </div>
         </DialogContent>
       </Dialog>
 
       <Dialog open={keyboardHelpOpen} onOpenChange={setKeyboardHelpOpen}>
         <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800">
           <DialogHeader>
             <DialogTitle className="text-2xl font-bold flex items-center gap-2">
               <Keyboard className="h-6 w-6 text-indigo-500" />
               Keyboard Shortcuts
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-6">
             {[
               { label: "Open Search", keys: "Ctrl + /" },
               { label: "Open Barcode Scanner", keys: "Ctrl + B" },
               { label: "Complete Sale", keys: "F10" },
               { label: "Close Dialogs", keys: "Esc" },
             ].map((shortcut, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                 <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{shortcut.label}</span>
                 <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-mono shadow-sm">
                   {shortcut.keys}
                 </kbd>
               </div>
             ))}
           </div>
         </DialogContent>
       </Dialog>

       <Dialog open={keyboardHelpOpen} onOpenChange={setKeyboardHelpOpen}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Keyboard className="h-5 w-5 text-indigo-500" />
               Keyboard Shortcuts
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-3 py-4">
             <div className="flex items-center justify-between">
               <span className="text-sm text-slate-600 dark:text-slate-400">Open Search</span>
               <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">Ctrl + /</kbd>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-slate-600 dark:text-slate-400">Open Barcode Scanner</span>
               <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">Ctrl + B</kbd>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-slate-600 dark:text-slate-400">Complete Sale</span>
               <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">F10</kbd>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-slate-600 dark:text-slate-400">Close Dialogs</span>
               <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">Esc</kbd>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
}
