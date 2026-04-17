"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  PackagePlus, 
  Users, 
  BarChart3, 
  Settings, 
  ArrowUpRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "New Sale",
    description: "Start a new transaction",
    icon: ShoppingCart,
    href: "/dashboard/pos",
    color: "bg-indigo-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    label: "Add Product",
    description: "Expand your inventory",
    icon: PackagePlus,
    href: "/dashboard/inventory/new",
    color: "bg-emerald-500",
    shadow: "shadow-emerald-500/20",
  },
  {
    label: "Manage Staff",
    description: "Users & Permissions",
    icon: Users,
    href: "/dashboard/users",
    color: "bg-purple-500",
    shadow: "shadow-purple-500/20",
  },
  {
    label: "View Reports",
    description: "Business analytics",
    icon: BarChart3,
    href: "/dashboard/reports",
    color: "bg-amber-500",
    shadow: "shadow-amber-500/20",
  },
  {
    label: "Settings",
    description: "Store configuration",
    icon: Settings,
    href: "/dashboard/settings",
    color: "bg-slate-500",
    shadow: "shadow-slate-500/20",
  },
];

export function QuickActions() {
  return (
    <Card className="card-premium h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Quick Actions
          <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start h-auto p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group",
                  "hover:pl-4"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-110",
                  action.color,
                  action.shadow
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{action.description}</p>
                </div>
              </Button>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
