"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HardHat,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface FieldTaskListProps {
  tasks: FieldTask[];
}

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
    case "ASSIGNED":
      return 10;
    case "EN_ROUTE":
      return 30;
    case "ON_SITE":
      return 50;
    case "IN_PROGRESS":
      return 75;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
}

export function FieldTaskList({ tasks }: FieldTaskListProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const getStatus = (task: FieldTask) => taskStatuses[task.id] || task.status;

  const activeTasks = tasks.filter((t) => getStatus(t) !== "COMPLETED");
  const completedTasks = tasks.filter((t) => getStatus(t) === "COMPLETED");

  const advanceStatus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const currentStatus = taskStatuses[taskId] || task.status;
    const nextStatus = STATUS_FLOW[currentStatus];
    if (nextStatus) {
      setTaskStatuses((prev) => ({ ...prev, [taskId]: nextStatus }));
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const renderTask = (task: FieldTask) => {
    const status = getStatus(task);
    const isExpanded = expandedTask === task.id;
    const progress = getStatusProgress(status);
    const ActionIcon = STATUS_ACTION_ICONS[status] || CheckCircle2;
    const isCompleted = status === "COMPLETED";

    return (
      <Card
        key={task.id}
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
                isCompleted
                  ? "[&>div]:bg-emerald-500"
                  : "[&>div]:bg-blue-500"
              }`}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>{status.replace(/_/g, " ")}</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors w-full"
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
              {/* Parts Inventory */}
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Parts Required
                </span>
                <div className="mt-1.5 space-y-1">
                  {task.partsNeeded.map((part, idx) => {
                    const isUsed =
                      task.partsUsed.includes(part) || isCompleted;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 text-xs p-1.5 rounded ${
                          isUsed
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isUsed ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Package className="size-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className={isUsed ? "line-through" : ""}>
                          {part}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

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
              onClick={() => advanceStatus(task.id)}
              className={`w-full text-xs font-semibold gap-2 ${
                task.priority === "URGENT"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <ActionIcon className="size-4" />
              {STATUS_ACTION_LABELS[status]}
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
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="active">
        <div className="flex items-center justify-between gap-3">
          <TabsList className="h-9">
            <TabsTrigger value="active" className="text-xs gap-1.5">
              <HardHat className="size-3.5" />
              Active ({activeTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Done ({completedTasks.length})
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-9"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw
              className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </div>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <CheckCircle2 className="size-8 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold">All tasks completed!</p>
              <p className="text-xs mt-1">Great work. Hit Sync to upload.</p>
            </div>
          ) : (
            activeTasks.map(renderTask)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No completed tasks yet.
            </div>
          ) : (
            completedTasks.map(renderTask)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
