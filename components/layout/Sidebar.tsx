"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Point of Sale", href: "/dashboard/pos", icon: ShoppingCart },
  { name: "Sales", href: "/dashboard/sales", icon: Receipt },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

export function Sidebar({ user, onLogout, mobileOpen: externalMobileOpen, setMobileOpen: externalSetMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);
  
  const mobileOpen = externalMobileOpen ?? internalMobileOpen;
  const setMobileOpen = (open: boolean) => {
    if (externalSetMobileOpen) {
      externalSetMobileOpen(open);
    } else {
      setInternalMobileOpen(open);
    }
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-4 bg-gradient-to-t from-slate-50/50 to-transparent dark:from-slate-800/50 dark:to-transparent">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <Avatar className="h-10 w-10 ring-2 ring-indigo-500/20 ring-offset-2 dark:ring-offset-slate-900">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-5 mt-0.5">
                {user.role}
              </Badge>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full justify-start mt-3 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
        {isCollapsed && (
          <Button variant="ghost" size="icon-sm" onClick={onLogout} className="w-full mt-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn("fixed top-0 left-0 z-50 flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-out", isCollapsed ? "w-[72px]" : "w-64", mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 lg:static")}>
        <div className={cn("flex items-center h-16 px-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80", isCollapsed ? "justify-center px-2" : "justify-between")}>
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text">POS System</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-0.5">Inventory & POS</p>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/dashboard" className="flex items-center justify-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3 top-20 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 dark:hover:border-indigo-600 hover:scale-110 transition-all duration-200 z-10">
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
        <NavContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}