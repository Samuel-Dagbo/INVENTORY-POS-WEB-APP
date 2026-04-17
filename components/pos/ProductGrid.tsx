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
import { Package, ShoppingCart, AlertCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
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
      (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    setAddingProduct(product._id);
    onAddToCart(product, 1);
    setTimeout(() => {
      setAddingProduct(null);
    }, 200);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Quick search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="flex h-12 p-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl gap-1">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category} 
                  className="rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={selectedCategory} className="w-full">
        <TabsContent value={selectedCategory} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-t-3xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="h-20 w-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                  {searchQuery ? "Try adjusting your search terms" : "Add products to your inventory to see them here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product, index) => {
                const stockStatus = getStockStatus(product);
                const isOutOfStock = product.stockQuantity === 0;

                return (
                  <Card
                    key={product._id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={cn(
                      "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1",
                      addingProduct === product._id && "ring-4 ring-indigo-500 ring-offset-2",
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
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-20 w-20 rounded-2xl bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center">
                            <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                         <div className="text-white text-xs font-bold flex items-center gap-1">
                           <ShoppingCart className="h-3 w-3" /> Add to Cart
                         </div>
                      </div>

                      <Badge
                        variant={stockStatus.variant}
                        className="absolute top-3 left-3 shadow-lg"
                      >
                        {stockStatus.label}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </h3>
                      </div>

                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              GH₵{product.sellingPrice.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Cost: GH₵{product.costPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold text-lg",
                              product.stockQuantity === 0
                                ? "text-red-500"
                                : product.stockQuantity <= product.lowStockThreshold
                                ? "text-amber-500"
                                : "text-emerald-500"
                            )}>
                              {product.stockQuantity}
                            </p>
                            <p className="text-[10px] text-slate-400">in stock</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
