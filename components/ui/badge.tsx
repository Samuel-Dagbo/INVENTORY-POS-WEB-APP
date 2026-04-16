import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
        destructive: "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-sm",
        outline: "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400",
        success: "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm",
        warning: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
        info: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm",
        pink: "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-px text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
