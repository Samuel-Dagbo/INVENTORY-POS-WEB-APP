"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ user, onLogout, onMenuClick, showMenuButton = false }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/inventory?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const recentSearches = [
    { icon: Package, label: "Search products", path: "/dashboard/inventory" },
    { icon: ShoppingCart, label: "New sale", path: "/dashboard/pos" },
    { icon: TrendingUp, label: "View reports", path: "/dashboard/reports" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-xl"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200",
              isSearchFocused ? "text-indigo-500" : "text-slate-400"
            )} />
            <Input
              type="search"
              placeholder="Search products, sales, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full pl-10 h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl",
                "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                "focus:bg-white dark:focus:bg-slate-800",
                "transition-all duration-200",
                isSearchFocused && "ring-2 ring-indigo-500/20 border-indigo-500"
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 pointer-events-none">
              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            </kbd>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm">Notifications</span>
                <Badge variant="secondary" className="text-xs">3 new</Badge>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      5 products are running low on stock
                    </p>
                    <p className="text-xs text-slate-400 mt-1">2 min ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Sale completed</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Invoice #INV-0012 completed
                    </p>
                    <p className="text-xs text-slate-400 mt-1">15 min ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">New product added</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      iPhone 15 Pro Max added to inventory
                    </p>
                    <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-xl p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="py-1">
                <DropdownMenuItem className="px-4 py-2.5 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="px-4 py-2.5 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <DropdownMenuItem
                  className="px-4 py-2.5 cursor-pointer text-red-600 dark:text-red-400"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}