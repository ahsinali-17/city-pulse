"use client";

import { useRef } from "react";
import { Camera, Upload, X, Sparkles, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const SAMPLE_PHOTOS = [
  {
    label: "Water Burst",
    url: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwbGVha2FnZXxlbnwwfHwwfHx8MA%3D%3D",
    category: "Water Leak",
    severity: 5,
    title: "High Pressure Water Main Burst",
  },
  {
    label: "Deep Pothole",
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    category: "Pothole",
    severity: 4,
    title: "Deep Pothole in Right Lane",
  },
  {
    label: "Fallen Tree",
    url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    category: "Tree Branch",
    severity: 2,
    title: "Overhanging Broken Tree Branch",
  },
];

interface HazardPhotoUploaderProps {
  selectedPhoto: string | null;
  onPhotoSelected: (url: string, base64: string) => void;
  onPhotoCleared: () => void;
}

export function HazardPhotoUploader({
  selectedPhoto,
  onPhotoSelected,
  onPhotoCleared,
}: HazardPhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onPhotoSelected("", base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Photo Preview or Placeholder */}
      {selectedPhoto ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-72 flex items-center justify-center group shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto}
            alt="Hazard photo"
            className="w-full h-72 object-cover object-center"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge className="bg-slate-900/80 text-white backdrop-blur-md text-[10px] font-mono border-0">
              <Camera className="size-3 mr-1" /> Attached Photo
            </Badge>
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              onClick={onPhotoCleared}
              className="rounded-full shadow-md"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
              <Upload className="size-6" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Take photo or upload image
            </span>
            <p className="text-xs text-muted-foreground max-w-xs">
              Gemini AI vision automatically analyzes incident severity, department routing, and category.
            </p>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Action Buttons & Sample Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs gap-1.5"
          >
            <Camera className="size-3.5" />
            <span>Upload Photo</span>
          </Button>
        </div>

        {/* Civic Preset Samples */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] text-muted-foreground whitespace-nowrap font-medium flex items-center gap-1">
            <FileImage className="size-3 text-slate-400" /> Presets:
          </span>
          {SAMPLE_PHOTOS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => onPhotoSelected(sample.url, "")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                selectedPhoto === sample.url
                  ? "bg-blue-600 text-white border-blue-600 font-semibold"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
