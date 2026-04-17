"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, BarChart3, TrendingUp, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">POS System</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                <span>Powerful Inventory & POS Solution</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Manage Your Business
                </span>
                <br />
                <span className="text-slate-900">With Confidence</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                A complete inventory management and point-of-sale system with real-time stock tracking, 
                cloud storage, and powerful analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login">
                  <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 rounded-xl">
                    Start Free Trial
                    <ShoppingCart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-xl border-slate-200 dark:border-slate-700">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Track stock levels, manage products, and get low stock alerts. 
                    Complete control over your inventory.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <ShoppingCart className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Point of Sale</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Fast checkout with barcode scanning, multiple payment methods, 
                    and receipt generation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Real-time dashboards, sales reports, and profit tracking 
                    to make informed decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Package, label: "Products", value: "10,000+" },
                { icon: ShoppingCart, label: "Transactions", value: "500K+" },
                { icon: BarChart3, label: "Businesses", value: "50,000+" },
                { icon: TrendingUp, label: "Uptime", value: "99.9%" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-indigo-500" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-indigo-100 text-lg mb-8">
              Start managing your inventory and POS today. Free trial with full features.
            </p>
            <Link href="/auth/login">
              <Button size="lg" className="h-12 px-8 text-base bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl rounded-xl">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/50 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">POS System</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2026 POS System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
