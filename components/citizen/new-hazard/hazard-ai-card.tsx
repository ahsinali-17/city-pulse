"use client";

import { Sparkles, Loader2, CheckCircle2, ShieldCheck, Building2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HazardAiCardProps {
  isScanning: boolean;
  aiScanned: boolean;
  confidence: number;
  category: string;
  severity: number;
  suggestedDepartmentId: string | null;
  aiExplanation: string;
}

const severityConfig: Record<number, { label: string; color: string; border: string }> = {
  1: { label: "1 - Low", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-700/60" },
  2: { label: "2 - Minor", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", border: "border-blue-300 dark:border-blue-700/60" },
  3: { label: "3 - Moderate", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", border: "border-amber-300 dark:border-amber-700/60" },
  4: { label: "4 - High", color: "bg-orange-500/15 text-orange-600 dark:text-orange-400", border: "border-orange-300 dark:border-orange-700/60" },
  5: { label: "5 - Critical", color: "bg-red-500/15 text-red-600 dark:text-red-400", border: "border-red-300 dark:border-red-700/60" },
};

export function HazardAiCard({
  isScanning,
  aiScanned,
  confidence,
  category,
  severity,
  suggestedDepartmentId,
  aiExplanation,
}: HazardAiCardProps) {
  const currentSeverity = severityConfig[severity] || severityConfig[3];

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Gemini AI Vision Analysis
            </span>
            <span className="text-[10px] text-muted-foreground">
              Automated classification & municipal routing
            </span>
          </div>
        </div>

        {isScanning ? (
          <Badge variant="outline" className="text-[10px] gap-1 border-blue-400 text-blue-600 animate-pulse">
            <Loader2 className="size-3 animate-spin" /> Scanning Image...
          </Badge>
        ) : (
          aiScanned && (
            <Badge variant="outline" className="text-[10px] gap-1 border-emerald-400 text-emerald-600 dark:text-emerald-400 font-mono">
              <CheckCircle2 className="size-3" /> {confidence.toFixed(1)}% Confidence
            </Badge>
          )
        )}
      </div>

      {/* Suggested Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-muted-foreground block font-medium">Category</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
            {category || "Detecting..."}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] text-muted-foreground block font-medium">Suggested Severity</span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 mt-0.5 border ${currentSeverity.border} ${currentSeverity.color}`}>
            {currentSeverity.label}
          </Badge>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-muted-foreground block font-medium">Routed Unit</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate">
            <Building2 className="size-3 text-purple-500 shrink-0" />
            <span className="truncate">{suggestedDepartmentId || "Triage Pending"}</span>
          </span>
        </div>
      </div>

      {aiExplanation && (
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
          <span className="font-semibold text-slate-700 dark:text-slate-300">AI Notes: </span>
          {aiExplanation}
        </p>
      )}
    </div>
  );
}
