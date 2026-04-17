"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/types";

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`);
        const data = await res.json();
        setResults(data.products || []);
        setIsOpen(true);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (product: Product) => {
    onSelect(product);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder="Search by name, SKU, or barcode..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        className="pr-10"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border shadow-lg overflow-hidden">
          <div ref={listRef} className="max-h-64 overflow-y-auto">
            {results.map((product, index) => (
              <button
                key={product._id}
                onClick={() => handleSelect(product)}
                className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex items-center justify-between ${
                  index === selectedIndex ? "bg-muted/50" : ""
                }`}
              >
               <div className="flex-1 min-w-0">
                 <p className="font-medium truncate">{product.name}</p>
                 <p className="text-sm text-muted-foreground">
                   {product.barcode ? `Barcode: ${product.barcode}` : "No barcode"}
                 </p>
               </div>
                <div className="text-right ml-4">
                   <p className="font-semibold">GH₵{product.sellingPrice.toFixed(2)}</p>
                  <p className={`text-sm ${product.stockQuantity <= product.lowStockThreshold ? "text-amber-600" : "text-green-600"}`}>
                    {product.stockQuantity} in stock
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border shadow-lg p-4 text-center text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
}
