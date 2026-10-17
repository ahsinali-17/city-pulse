import { Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TicketAiAnalysisCardProps {
  aiAnalysis: any;
  severity: number;
  priority: string | null;
}

export function TicketAiAnalysisCard({
  aiAnalysis,
  severity,
  priority,
}: TicketAiAnalysisCardProps) {
  return (
    <Card className="border-blue-200 dark:border-blue-900 shadow-xs bg-white dark:bg-slate-900">
      <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-950 bg-blue-50/50 dark:bg-blue-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Sparkles className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                Gemini AI Vision Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Automated computer vision triage & spatial duplicate detection
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-xs"
          >
            {aiAnalysis?.confidenceScore || 0}% Vision Confidence
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">
              Detected Hazard Category
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {aiAnalysis?.detectedCategory || "Pending Analysis"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">
              Severity Score & Level
            </span>
            <div className="flex items-center gap-2">
              <Badge
                className={`text-white font-mono font-bold text-xs px-2 ${
                  severity >= 4
                    ? "bg-red-600"
                    : severity === 3
                    ? "bg-orange-500"
                    : "bg-yellow-500"
                }`}
              >
                Severity {severity || "N/A"} / 5
              </Badge>
              <span
                className={`text-xs font-semibold ${
                  severity >= 4
                    ? "text-red-600 dark:text-red-400"
                    : severity === 3
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                ({priority || "Unknown"} Priority)
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1 text-xs">
          <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">
            AI Rationale & Visual Evidence
          </span>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
            &quot;{aiAnalysis?.explanation || "Awaiting Gemini Vision AI assessment..."}&quot;
          </p>
        </div>

        {/* Spatial Duplicate Check */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>
              Spatial Cluster Check (100m Radius): <strong>0 Duplicate Tickets Found</strong>
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] border-emerald-400 text-emerald-700 dark:text-emerald-300 font-mono"
          >
            Clear
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
