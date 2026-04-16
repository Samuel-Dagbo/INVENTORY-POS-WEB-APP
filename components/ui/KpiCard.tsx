"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  variant?: "emerald" | "indigo" | "amber" | "purple" | "rose" | "blue";
}

const gradientStyles = {
  emerald: "from-emerald-500 to-green-600",
  indigo: "from-indigo-500 to-purple-600",
  amber: "from-amber-500 to-orange-500",
  purple: "from-purple-500 to-pink-600",
  rose: "from-rose-500 to-red-600",
  blue: "from-blue-500 to-cyan-600",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  className,
  variant = "indigo",
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1",
        "animate-fade-in border border-slate-200/80 dark:border-slate-800/80",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110",
              gradientStyles[variant]
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-1.5 mt-3">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
                trendUp
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {trendUp ? (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              {trend}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">vs last week</span>
          </div>
        )}
      </CardContent>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-1.5",
          gradientStyles[variant]
        )}
      />
    </Card>
  );
}