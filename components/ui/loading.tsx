"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            <Button onClick={this.handleRetry}>Try Again</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-indigo-500 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = "" }: LoadingCardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 animate-pulse ${className}`}>
      <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className = "" }: LoadingSkeletonProps) {
  return <div className={`bg-slate-200 dark:bg-slate-700 rounded animate-pulse ${className}`} />;
}

interface PageLoadingProps {
  title?: string;
}

export function PageLoading({ title = "Loading..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-slate-500 dark:text-slate-400">{title}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && (
        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}