"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, mutate } = useSWR<{
    products: Product[];
    categories: string[];
  }>(`/api/products?limit=100`, fetcher);

  const filteredProducts = (data?.products || []).filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery));
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async () => {
    if (!deleteProduct) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteProduct._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
        setDeleteProduct(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your products and stock levels
          </p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button className="h-11 px-5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {(data?.categories || []).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <CardContent className="p-4 space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
                <div className="flex justify-between pt-2">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="py-16 border border-slate-200/50 dark:border-slate-700/50">
          <CardContent className="flex flex-col items-center justify-center text-slate-400">
            <Package className="h-14 w-14 mb-4 opacity-30" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">No products found</p>
            <p className="text-sm mt-1">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your filters"
                : "Add your first product to get started"}
            </p>
            {!searchQuery && selectedCategory === "All" && (
              <Link href="/dashboard/inventory/new" className="mt-4">
                <Button className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            return (
              <Card
                key={product._id}
                className={cn(
                  "group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover:-translate-y-1",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant={stockStatus.variant}
                      className="text-xs shadow-sm"
                    >
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1.5 translate-y-[-5px] group-hover:translate-y-0">
                    <Link href={`/dashboard/inventory/${product._id}/edit`}>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/90 hover:bg-white shadow-md rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 shadow-md rounded-lg"
                      onClick={() => setDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold truncate text-slate-900 dark:text-slate-100">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        SKU: {product.SKU}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Category</span>
                      <Badge variant="secondary" className="rounded-md">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <div>
                        <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ${product.sellingPrice.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Cost: ${product.costPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-semibold text-lg",
                            product.stockQuantity <= product.lowStockThreshold
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {product.stockQuantity}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">in stock</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteProduct(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}