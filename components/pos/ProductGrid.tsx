"use client";

import React, { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Product } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Minus, ShoppingCart, AlertCircle, Search, Grid3X3, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  const { data, isLoading } = useSWR<{
    products: Product[];
    categories: string[];
  }>(`/api/products?limit=100`, fetcher);

  const categories = ["All", ...(data?.categories || [])];

  const filteredProducts = (data?.products || []).filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.SKU.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product._id] || 1;
    setAddingProduct(product._id);
    onAddToCart(product, quantity);
    setTimeout(() => {
      setAddingProduct(null);
      setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    }, 300);
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) {
      return { variant: "destructive" as const, label: "Out of Stock" };
    }
    if (product.stockQuantity <= product.lowStockThreshold) {
      return { variant: "warning" as const, label: "Low Stock" };
    }
    return { variant: "success" as const, label: "In Stock" };
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm"
        />
      </div>

      {/* Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl gap-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 animate-pulse">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                  {searchQuery ? "Try adjusting your search terms" : "Add products to your inventory to see them here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product);
                const isOutOfStock = product.stockQuantity === 0;
                const quantity = quantities[product._id] || 1;

                return (
                  <div
                    key={product._id}
                    className={cn(
                      "rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:-translate-y-1",
                      addingProduct === product._id && "ring-2 ring-indigo-500 ring-offset-2",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-20 w-20 rounded-2xl bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-400" />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

                      <Badge 
                        variant={stockStatus.variant} 
                        className="absolute top-3 left-3 shadow-lg"
                      >
                        {isOutOfStock && <AlertCircle className="h-3 w-3 mr-1" />}
                        {stockStatus.label}
                      </Badge>

                      <div className="absolute bottom-3 right-3">
                        <p className="text-xs font-medium text-white bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                          Stock: {product.stockQuantity}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {product.category} • SKU: {product.SKU}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            ${product.sellingPrice.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Cost: ${product.costPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {isOutOfStock ? (
                        <Button className="w-full rounded-xl" disabled>
                          Out of Stock
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-none hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => handleQuantityChange(product._id, -1)}
                              disabled={quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-semibold bg-white dark:bg-slate-900">
                              {quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="h-8 w-8 rounded-none hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => handleQuantityChange(product._id, 1)}
                              disabled={quantity >= product.stockQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/20 rounded-lg transition-all duration-200"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1.5" />
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
