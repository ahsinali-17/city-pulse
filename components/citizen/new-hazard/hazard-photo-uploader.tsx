"use client";

import { useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Submission Templates ─────────────────────────────────────────────────────
// These are display-only examples. Selecting them prefills the form with static
// AI analysis — they do NOT trigger a real AI scan or unlock the submit button.
// The user MUST upload their own photo to enable submission.

export interface SubmissionTemplate {
  id: string;
  label: string;
  imageUrl: string;
  category: string;
  severity: number;
  title: string;
  description: string;
  suggestedDepartmentId: string;
  aiAnalysis: {
    detectedCategory: string;
    severityScore: number;
    severityLabel: string;
    confidenceScore: number;
    explanation: string;
  };
}

export const SUBMISSION_TEMPLATES: SubmissionTemplate[] = [
  {
    id: "tpl-water",
    label: "Water Burst",
    imageUrl:
      "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
    category: "Water Leak",
    severity: 5,
    title: "High Pressure Water Main Burst",
    description:
      "Water gushing from asphalt near sewer grate, causing road erosion and flooding sidewalk.",
    suggestedDepartmentId: "dept-water",
    aiAnalysis: {
      detectedCategory: "Water Infrastructure Failure",
      severityScore: 5,
      severityLabel: "Critical",
      confidenceScore: 97.4,
      explanation:
        "Gemini Vision detected active pressurised water discharge on a public asphalt roadway. High risk of sub-base erosion and vehicular hazard.",
    },
  },
  {
    id: "tpl-pothole",
    label: "Deep Pothole",
    imageUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    category: "Pothole",
    severity: 4,
    title: "Deep Pothole in Right Lane",
    description:
      "Deep cavity in right lane near bus stop, approximately 8 inches deep. Vehicle tire blowout risk.",
    suggestedDepartmentId: "dept-roads",
    aiAnalysis: {
      detectedCategory: "Asphalt Structural Damage",
      severityScore: 4,
      severityLabel: "High",
      confidenceScore: 94.1,
      explanation:
        "Deep roadway depression identified near high-transit lane. Vehicle tire blowout risk requiring immediate asphalt patching.",
    },
  },
  {
    id: "tpl-tree",
    label: "Fallen Tree",
    imageUrl:
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    category: "Tree Branch",
    severity: 2,
    title: "Fallen Oak Branch Blocking Pathway",
    description:
      "Large fallen oak branch blocking pedestrian path at park entrance. Pathway impassable.",
    suggestedDepartmentId: "dept-parks",
    aiAnalysis: {
      detectedCategory: "Fallen Vegetation Obstruction",
      severityScore: 2,
      severityLabel: "Low",
      confidenceScore: 91.0,
      explanation:
        "Fallen branch obstructing pedestrian access. No immediate vehicular danger but requires crew clearance.",
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface HazardPhotoUploaderProps {
  /** The currently previewed photo URL/base64. null = empty state. */
  selectedPhoto: string | null;
  /** ID of the active template, or null if user uploaded their own photo. */
  activeTemplateId: string | null;
  onRealPhotoSelected: (base64: string) => void;
  onTemplateSelected: (template: SubmissionTemplate) => void;
  onPhotoCleared: () => void;
}

export function HazardPhotoUploader({
  selectedPhoto,
  activeTemplateId,
  onRealPhotoSelected,
  onTemplateSelected,
  onPhotoCleared,
}: HazardPhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected after clear
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onRealPhotoSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* ── Photo Preview or Upload Placeholder ────────────────────────── */}
      {selectedPhoto ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 h-64 flex items-center justify-center group shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedPhoto}
            alt="Hazard photo preview"
            className="w-full h-full object-cover object-center"
          />

          {/* Template badge */}
          {activeTemplateId && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-violet-600/90 text-white backdrop-blur-md text-[10px] font-semibold border-0">
                Example Template
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <Badge className="bg-slate-900/80 text-white backdrop-blur-md text-[10px] font-mono border-0">
              <Camera className="size-3 mr-1" />
              {activeTemplateId ? "Preview" : "Your Photo"}
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

          {/* Overlay hint for template mode */}
          {activeTemplateId && (
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-900/80 to-transparent p-3">
              <p className="text-[11px] text-slate-200 text-center">
                📸 Upload your own photo below to enable submission
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty drop zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40 h-64 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
              <Upload className="size-6" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Take photo or upload image
            </span>
            <p className="text-xs text-muted-foreground max-w-xs">
              Gemini AI will automatically analyze severity, routing, and category.
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

      {/* ── Upload Button ───────────────────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="text-xs gap-1.5 w-full"
      >
        <Camera className="size-3.5" />
        {activeTemplateId ? "Upload Your Own Photo (Required to Submit)" : "Upload Photo"}
      </Button>

      {/* ── Example Templates (image + label cards) ─────────────────────── */}
      <div className="space-y-2">
        <p className="text-[11px] text-muted-foreground font-medium">
          📋 Example templates — pick one to see how to fill the form:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {SUBMISSION_TEMPLATES.map((tpl) => {
            const isActive = activeTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onTemplateSelected(tpl)}
                className={`relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "border-blue-500 shadow-md shadow-blue-500/20 scale-[0.98]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                }`}
                aria-pressed={isActive}
                aria-label={`Use ${tpl.label} template`}
              >
                {/* Template thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tpl.imageUrl}
                  alt={tpl.label}
                  className="w-full h-16 object-cover object-center"
                />
                {/* Label overlay */}
                <div
                  className={`px-1.5 py-1 text-center text-[10px] font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {tpl.label}
                </div>
                {/* Active tick */}
                {isActive && (
                  <div className="absolute top-1 right-1 size-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
