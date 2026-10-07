"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Navigation,
  Package,
  Play,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { type FieldTask } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { updateTicketState } from "@/app/field/actions";
import { FieldTaskParts } from "./field-task-parts";

const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300",
  HIGH: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
  LOW: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
};

const STATUS_FLOW: Record<string, string> = {
  ASSIGNED: "EN_ROUTE",
  EN_ROUTE: "ON_SITE",
  ON_SITE: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  ASSIGNED: "Accept & Start Route",
  EN_ROUTE: "Mark Arrived On-Site",
  ON_SITE: "Begin Repair Work",
  IN_PROGRESS: "Mark as Completed",
};

const STATUS_ACTION_ICONS: Record<string, React.ElementType> = {
  ASSIGNED: Play,
  EN_ROUTE: Navigation,
  ON_SITE: Wrench,
  IN_PROGRESS: CheckCircle2,
};

function getStatusProgress(status: string): number {
  switch (status) {
    case "ASSIGNED": return 10;
    case "EN_ROUTE": return 30;
    case "ON_SITE": return 50;
    case "IN_PROGRESS": return 75;
    case "COMPLETED": return 100;
    default: return 0;
  }
}

interface FieldTaskCardProps {
  task: FieldTask;
}

export function FieldTaskCard({ task }: FieldTaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const status = task.status;
  const isCompleted = status === "COMPLETED";
  const progress = getStatusProgress(status);
  const ActionIcon = STATUS_ACTION_ICONS[status] || CheckCircle2;

  const advanceStatus = () => {
    const nextStatus = STATUS_FLOW[status];
    if (nextStatus) {
      startTransition(() => {
        updateTicketState(task.id, nextStatus, task.partsNeeded, task.partsUsed);
      });
    }
  };

  return (
    <Card
      className={`border transition-all ${
        isCompleted
          ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10 opacity-75"
          : task.priority === "URGENT"
          ? "border-red-200 dark:border-red-900 shadow-sm shadow-red-100 dark:shadow-red-950/20"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Task Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge
                variant="outline"
                className={`font-mono text-[10px] ${PRIORITY_STYLES[task.priority]}`}
              >
                {task.priority === "URGENT" && (
                  <AlertTriangle className="size-3 mr-0.5" />
                )}
                {task.priority}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-mono">
                Sev {task.severity}/5
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground">
                {task.id}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {task.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{task.address}</span>
            </div>
          </div>

          {/* ETA & Time */}
          {!isCompleted && (
            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="size-3" />
                {task.estimatedMinutes}m
              </div>
              <span className="text-[10px] text-muted-foreground">
                {task.reportedAt}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress
            value={progress}
            className={`h-1.5 ${
              isCompleted ? "[&>div]:bg-emerald-500" : "[&>div]:bg-blue-500"
            }`}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{status.replace(/_/g, " ")}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors w-full cursor-pointer"
        >
          <Package className="size-3.5" />
          Parts & Notes ({task.partsNeeded.length} items)
          {isExpanded ? (
            <ChevronUp className="size-3.5 ml-auto" />
          ) : (
            <ChevronDown className="size-3.5 ml-auto" />
          )}
        </button>

        {/* Expanded Details Panel */}
        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Parts Inventory Component */}
            <FieldTaskParts task={task} isPending={isPending} startTransition={startTransition} />

            {/* Dispatch Notes */}
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Dispatch Notes
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-200/60 dark:border-slate-700">
                {task.notes}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isCompleted && STATUS_FLOW[status] && (
          <Button
            onClick={advanceStatus}
            disabled={isPending}
            className={`w-full text-xs font-semibold gap-2 cursor-pointer ${
              task.priority === "URGENT"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPending ? <RefreshCw className="size-4 animate-spin" /> : <ActionIcon className="size-4" />}
            {isPending ? "Updating Database..." : STATUS_ACTION_LABELS[status]}
          </Button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
            <CheckCircle2 className="size-4" />
            Task Completed — Synced
          </div>
        )}
      </CardContent>
    </Card>
  );
}
