"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Link, X, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onChange]);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setShowUrlInput(false);
      setUrlInput("");
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreviewUrl("");
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative w-full h-48 rounded-lg border bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={() => setPreviewUrl("")}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white"
              onClick={() => setShowUrlInput(true)}
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-gradient-to-br from-slate-100 to-slate-50">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No image set</p>
        </div>
      )}

      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            autoFocus
          />
          <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
            Add
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={disabled || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowUrlInput(true)}
            disabled={disabled}
          >
            <Link className="h-4 w-4 mr-2" />
            URL
          </Button>
        </div>
      )}
    </div>
  );
}
