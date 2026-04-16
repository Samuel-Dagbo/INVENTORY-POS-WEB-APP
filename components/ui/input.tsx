import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border bg-white dark:bg-slate-900 px-4 py-2 text-sm transition-all duration-200",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "border-slate-200 dark:border-slate-700",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-primary",
            "hover:border-slate-300 dark:hover:border-slate-600",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
