"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  PackageX,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data, isLoading, mutate } = useSWR<{
    products: Product[];
    categories: string[];
  }>(`/api/products?limit=100`, fetcher);

    const filteredProducts = (data?.products || []).filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchQuery.toLowerCase()));
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

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse skeleton-premium" />
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse skeleton-premium" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse skeleton-premium" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inventory"
        description={`${filteredProducts.length} products`}
        actions={
          <Link href="/dashboard/inventory/new">
            <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-95">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Button>
          </Link>
        }
      />
 
      {/* Search and Filters */}
      <Card className="overflow-hidden card-premium shadow-glow-sm border-slate-200/50 dark:border-slate-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11 text-sm input-premium"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-52 h-11 input-premium">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Categories" />
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
 
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2.5 transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <Package className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-2.5 transition-all duration-200",
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

       {/* Empty State */}
       {filteredProducts.length === 0 && (
         <Card className="overflow-hidden glass-card border-slate-200/50 dark:border-slate-800/50">
           <CardContent className="flex flex-col items-center justify-center py-20">
             <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-6 shadow-inner">
               <PackageX className="h-12 w-12 text-slate-400" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
               No products found
             </h3>
             <p className="text-slate-500 dark:text-slate-400 text-center mb-8 max-w-md">
               {searchQuery || selectedCategory !== "All"
                 ? "Try adjusting your search or filters to find what you're looking for."
                 : "Get started by adding your first product to the inventory."}
             </p>
             {!searchQuery && selectedCategory === "All" && (
               <Link href="/dashboard/inventory/new">
                 <Button size="lg" className="bg-gradient-primary hover:bg-gradient-primary-hover shadow-lg shadow-indigo-500/25 transition-all duration-300 active:scale-95">
                   <Plus className="h-5 w-5 mr-2" />
                   Add Product
                 </Button>
               </Link>
             )}
           </CardContent>
         </Card>
       )}

       {/* Products Grid View */}
       {filteredProducts.length > 0 && viewMode === "grid" && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
           {filteredProducts.map((product, index) => {
             const stockStatus = getStockStatus(product);
             return (
               <Card
                 key={product._id}
                 className={cn(
                   "group overflow-hidden transition-all duration-300 hover:-translate-y-2 animate-fade-in",
                   "card-premium shadow-glow-sm"
                 )}
                 style={{ animationDelay: `${index * 30}ms` }}
               >
                 <div className="relative aspect-square bg-slate-50 dark:bg-slate-900 overflow-hidden">
                   {product.imageUrl ? (
                     <Image
                       src={product.imageUrl}
                       alt={product.name}
                       fill
                       className="object-cover transition-transform duration-500 group-hover:scale-110"
                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                     />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center">
                       <div className="h-24 w-24 rounded-2xl bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                         <Package className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                       </div>
                     </div>
                   )}
 
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
 
                   <Badge
                     variant={stockStatus.variant}
                     className="absolute top-3 left-3 shadow-lg backdrop-blur-md"
                   >
                     {stockStatus.label}
                   </Badge>
 
                   <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                     <Link href={`/dashboard/inventory/${product._id}/edit`} className="flex-1">
                       <Button size="sm" variant="secondary" className="w-full shadow-lg h-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
                         <Edit className="h-3.5 w-3.5 mr-1.5" />
                         Edit
                       </Button>
                     </Link>
                     <Button
                       size="sm"
                       variant="destructive"
                       className="shadow-lg h-9 bg-red-500/90 dark:bg-red-600/90 backdrop-blur-md"
                       onClick={(e) => {
                         e.stopPropagation();
                         setDeleteProduct(product);
                       }}
                     >
                       <Trash2 className="h-3.5 w-3.5" />
                     </Button>
                   </div>
                 </div>
 
                 <CardContent className="p-4">
                   <div className="space-y-3">
                       <div>
                         <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                           {product.name}
                         </h3>
                       </div>
 
                     <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                       {product.category}
                     </Badge>
 
                     <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                       <div>
                         <p className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                           ${product.sellingPrice.toFixed(2)}
                         </p>
                         <p className="text-[10px] text-slate-400">
                           Cost: ${product.costPrice.toFixed(2)}
                         </p>
                       </div>
                       <div className="text-right">
                         <p className={cn(
                           "font-black text-xl",
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

       {/* Products Table View */}
       {filteredProducts.length > 0 && viewMode === "table" && (
         <Card className="overflow-hidden card-premium shadow-glow-sm border-slate-200/50 dark:border-slate-800/50">
           <div className="overflow-x-auto">
             <table className="w-full table-premium">
               <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                   <th className="px-4 py-4 text-left font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Product
                   </th>
                   <th className="px-4 py-4 text-left font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     SKU
                   </th>
                   <th className="px-4 py-4 text-left font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Category
                   </th>
                   <th className="px-4 py-4 text-right font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Price
                   </th>
                   <th className="px-4 py-4 text-right font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Stock
                   </th>
                   <th className="px-4 py-4 text-center font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-4 py-4 text-right font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {filteredProducts.map((product, index) => {
                   const stockStatus = getStockStatus(product);
                   return (
                     <tr
                       key={product._id}
                       className={cn(
                         "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200",
                         "animate-fade-in"
                       )}
                       style={{ animationDelay: `${index * 20}ms` }}
                     >
                       <td className="px-4 py-4">
                         <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                             {product.imageUrl ? (
                               <Image
                                 src={product.imageUrl}
                                 alt={product.name}
                                 width={40}
                                 height={40}
                                 className="object-cover"
                               />
                             ) : (
                               <Package className="h-5 w-5 text-slate-400" />
                             )}
                           </div>
                           <div className="min-w-0">
                             <p className="font-bold text-slate-900 dark:text-white truncate">
                               {product.name}
                             </p>
                             {product.barcode && (
                               <p className="text-xs text-slate-400 font-mono truncate">
                                 {product.barcode}
                               </p>
                             )}
                           </div>
                         </div>
                       </td>
                       <td className="px-4 py-4">
                         <div className="flex items-center justify-center">
                           <span className="text-slate-300 dark:text-slate-700 text-xs italic">N/A</span>
                         </div>
                       </td>
                       <td className="px-4 py-4">
                         <Badge variant="secondary" size="sm" className="text-[10px] uppercase tracking-wider">
                           {product.category}
                         </Badge>
                       </td>
                       <td className="px-4 py-4 text-right">
                         <span className="font-bold text-slate-900 dark:text-white">
                           ${product.sellingPrice.toFixed(2)}
                         </span>
                       </td>
                       <td className="px-4 py-4 text-right">
                         <span className={cn(
                           "font-black",
                           product.stockQuantity === 0
                             ? "text-red-500"
                             : product.stockQuantity <= product.lowStockThreshold
                             ? "text-amber-500"
                             : "text-emerald-500"
                         )}>
                           {product.stockQuantity}
                         </span>
                       </td>
                       <td className="px-4 py-4 text-center">
                         <Badge variant={stockStatus.variant} size="sm" className="text-[10px] uppercase tracking-wider">
                           {stockStatus.label}
                         </Badge>
                       </td>
                       <td className="px-4 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Link href={`/dashboard/inventory/${product._id}/edit`}>
                             <Button variant="ghost" size="icon-sm" className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                               <Edit className="h-4 w-4" />
                             </Button>
                           </Link>
                           <Button
                             variant="ghost"
                             size="icon-sm"
                             className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                             onClick={() => setDeleteProduct(product)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </Card>
       )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-xl">Delete Product</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">&quot;{deleteProduct?.name}&quot;</span>? 
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              loading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
