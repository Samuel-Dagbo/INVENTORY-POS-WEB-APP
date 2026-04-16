"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Store, 
  Bell, 
  CreditCard, 
  Database,
  Save,
  Loader2,
  User,
  Palette,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [storeSettings, setStoreSettings] = useState({
    storeName: "My Store",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "USD",
    taxRate: "10",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlert: true,
    dailySalesReport: true,
    newSaleNotification: true,
    emailNotifications: true,
    email: "",
  });

  const [posSettings, setPosSettings] = useState({
    defaultPaymentMode: "cash",
    receiptPrinter: false,
    autoPrintReceipt: false,
    soundEffects: true,
    quickSaleMode: false,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedMessage(`${section} saved successfully!`);
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your system preferences"
      />

      {savedMessage && (
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center">
          <Save className="h-5 w-5 mr-2" />
          {savedMessage}
        </div>
      )}

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="pos" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">POS</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Phone</Label>
                  <Input
                    id="storePhone"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({ ...storeSettings, taxRate: e.target.value })}
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="storeAddress">Address</Label>
                <Input
                  id="storeAddress"
                  value={storeSettings.storeAddress}
                  onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                  className="rounded-xl mt-1"
                />
              </div>
              <Button onClick={() => handleSave("Store settings")} disabled={isSaving} className="rounded-xl">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-slate-500">Get notified when products are running low</p>
                  </div>
                  <Button
                    variant={notificationSettings.lowStockAlert ? "default" : "outline"}
                    onClick={() => setNotificationSettings({ ...notificationSettings, lowStockAlert: !notificationSettings.lowStockAlert })}
                    className="rounded-xl"
                  >
                    {notificationSettings.lowStockAlert ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Sales Report</p>
                    <p className="text-sm text-slate-500">Receive daily sales summary</p>
                  </div>
                  <Button
                    variant={notificationSettings.dailySalesReport ? "default" : "outline"}
                    onClick={() => setNotificationSettings({ ...notificationSettings, dailySalesReport: !notificationSettings.dailySalesReport })}
                    className="rounded-xl"
                  >
                    {notificationSettings.dailySalesReport ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Sale Sounds</p>
                    <p className="text-sm text-slate-500">Play sound on new sale</p>
                  </div>
                  <Button
                    variant={notificationSettings.soundEffects ? "default" : "outline"}
                    onClick={() => setNotificationSettings({ ...notificationSettings, soundEffects: !notificationSettings.soundEffects })}
                    className="rounded-xl"
                  >
                    {notificationSettings.soundEffects ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive reports via email</p>
                  </div>
                  <Button
                    variant={notificationSettings.emailNotifications ? "default" : "outline"}
                    onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                    className="rounded-xl"
                  >
                    {notificationSettings.emailNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
              {notificationSettings.emailNotifications && (
                <div>
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={notificationSettings.email}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, email: e.target.value })}
                    className="rounded-xl mt-1"
                  />
                </div>
              )}
              <Button onClick={() => handleSave("Notification settings")} disabled={isSaving} className="rounded-xl">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                POS Settings
              </CardTitle>
              <CardDescription>
                Configure point of sale behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defaultPayment">Default Payment Mode</Label>
                  <Select
                    value={posSettings.defaultPaymentMode}
                    onValueChange={(value) => setPosSettings({ ...posSettings, defaultPaymentMode: value })}
                  >
                    <SelectTrigger className="rounded-xl mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quick Sale Mode</p>
                    <p className="text-sm text-slate-500">Simplified interface for fast transactions</p>
                  </div>
                  <Button
                    variant={posSettings.quickSaleMode ? "default" : "outline"}
                    onClick={() => setPosSettings({ ...posSettings, quickSaleMode: !posSettings.quickSaleMode })}
                    className="rounded-xl"
                  >
                    {posSettings.quickSaleMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound Effects</p>
                    <p className="text-sm text-slate-500">Play sounds for actions</p>
                  </div>
                  <Button
                    variant={posSettings.soundEffects ? "default" : "outline"}
                    onClick={() => setPosSettings({ ...posSettings, soundEffects: !posSettings.soundEffects })}
                    className="rounded-xl"
                  >
                    {posSettings.soundEffects ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Print Receipt</p>
                    <p className="text-sm text-slate-500">Automatically print after sale</p>
                  </div>
                  <Button
                    variant={posSettings.autoPrintReceipt ? "default" : "outline"}
                    onClick={() => setPosSettings({ ...posSettings, autoPrintReceipt: !posSettings.autoPrintReceipt })}
                    className="rounded-xl"
                  >
                    {posSettings.autoPrintReceipt ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
              <Button onClick={() => handleSave("POS settings")} disabled={isSaving} className="rounded-xl">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="rounded-xl mt-1"
                  />
                </div>
                <div></div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>
              <Button className="rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reset All Data</p>
                  <p className="text-sm text-slate-500">This will delete all sales and reset to defaults</p>
                </div>
                <Button variant="destructive" className="rounded-xl">
                  Reset Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}