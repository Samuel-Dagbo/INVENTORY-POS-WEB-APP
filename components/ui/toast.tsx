"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "warning" | "critical" | "info";
  title: string;
  message: string;
  createdAt?: string;
}

interface ToastContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt">) => {
    const id = Date.now().toString();
    setNotifications((prev) => [
      ...prev,
      { ...notification, id, createdAt: new Date().toISOString() },
    ]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <ToastContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { notifications, removeNotification } = useToast();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-in",
            notification.type === "success" && "bg-emerald-50/95 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
            notification.type === "warning" && "bg-amber-50/95 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
            notification.type === "critical" && "bg-rose-50/95 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800",
            notification.type === "info" && "bg-indigo-50/95 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800"
          )}
        >
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
            notification.type === "success" && "bg-emerald-100 dark:bg-emerald-800/50",
            notification.type === "warning" && "bg-amber-100 dark:bg-amber-800/50",
            notification.type === "critical" && "bg-rose-100 dark:bg-rose-800/50",
            notification.type === "info" && "bg-indigo-100 dark:bg-indigo-800/50"
          )}>
            {notification.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            {notification.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            {notification.type === "critical" && <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
            {notification.type === "info" && <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm font-semibold",
              notification.type === "success" && "text-emerald-800 dark:text-emerald-300",
              notification.type === "warning" && "text-amber-800 dark:text-amber-300",
              notification.type === "critical" && "text-rose-800 dark:text-rose-300",
              notification.type === "info" && "text-indigo-800 dark:text-indigo-300"
            )}>
              {notification.title}
            </p>
            <p className={cn(
              "text-xs mt-0.5",
              notification.type === "success" && "text-emerald-600 dark:text-emerald-400",
              notification.type === "warning" && "text-amber-600 dark:text-amber-400",
              notification.type === "critical" && "text-rose-600 dark:text-rose-400",
              notification.type === "info" && "text-indigo-600 dark:text-indigo-400"
            )}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className={cn(
              "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
              notification.type === "success" && "text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-800/50",
              notification.type === "warning" && "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-800/50",
              notification.type === "critical" && "text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-800/50",
              notification.type === "info" && "text-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-800/50"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

export { ToastContainer };