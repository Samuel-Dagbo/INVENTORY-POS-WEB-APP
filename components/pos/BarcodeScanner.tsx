"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");

  useEffect(() => {
    if (!isOpen || scanning) return;

    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode("barcode-reader");
        html5QrcodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
          },
          (decodedText) => {
            if (decodedText !== lastScannedRef.current) {
              lastScannedRef.current = decodedText;
              handleScan(decodedText);
            }
          },
          () => {}
        );
        setScanning(true);
        setError("");
      } catch (err) {
        setError("Camera not accessible. Please use manual input.");
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      if (html5QrcodeRef.current?.isScanning) {
        html5QrcodeRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  const handleScan = (barcode: string) => {
    onScan(barcode);
    stopScanner();
    onClose();
    setManualBarcode("");
    lastScannedRef.current = "";
  };

  const stopScanner = async () => {
    if (html5QrcodeRef.current?.isScanning) {
      await html5QrcodeRef.current.stop();
    }
    setScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
    setError("");
    setManualBarcode("");
    lastScannedRef.current = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a barcode or enter it manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg border bg-black">
            <div id="barcode-reader" className="min-h-[200px]" />
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-indigo-500 rounded-lg" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-0.5 bg-indigo-500 animate-pulse" />
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter manually
              </span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="Enter barcode..."
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!manualBarcode.trim()}>
              Add
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
