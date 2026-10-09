"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, HardHat, RefreshCw, WifiOff, CloudUpload } from "lucide-react";
import { type FieldTask } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FieldTaskCard } from "./field-task-card";
import { useLiveQuery } from "dexie-react-hooks";
import {
  offlineDB,
  cacheTasksLocally,
  clearPendingSyncItem,
} from "@/lib/db/offline";
import { updateTicketState } from "@/app/field/actions";

interface FieldTaskListProps {
  initialTasks: FieldTask[];
}

export function FieldTaskList({ initialTasks }: FieldTaskListProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Live query from Dexie IndexedDB
  const cachedTasks = useLiveQuery(
    async () => {
      if (!offlineDB) return [];
      return await offlineDB.tasks.toArray();
    },
    [],
    []
  );

  const pendingSyncItems = useLiveQuery(
    async () => {
      if (!offlineDB) return [];
      return await offlineDB.pendingSync.toArray();
    },
    [],
    []
  );

   // Flush pending sync queue to server
  const processSyncQueue = useCallback(async () => {
    if (!offlineDB || !navigator.onLine) return;
    const items = await offlineDB.pendingSync.toArray();
    if (items.length === 0) return;

    setIsSyncing(true);
    try {
      for (const item of items) {
        await updateTicketState(
          item.ticketId,
          item.newStatus,
          item.partsNeeded,
          item.partsUsed
        );
        if (item.id) {
          await clearPendingSyncItem(item.id);
        }
      }
    } catch (error) {
      console.error("Error processing offline sync queue:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Seed / sync server tasks into Dexie on initial load when online
  useEffect(() => {
    cacheTasksLocally(initialTasks);
  }, [initialTasks]);

  // Track online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-sync when network returns
  useEffect(() => {
    if (isOnline && pendingSyncItems && pendingSyncItems.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, pendingSyncItems, processSyncQueue]);

  // Display either live cached tasks or server fallback
  const tasksToDisplay =
    cachedTasks && cachedTasks.length > 0 ? cachedTasks : initialTasks;

  const activeTasks = tasksToDisplay.filter((t) => t.status !== "COMPLETED");
  const completedTasks = tasksToDisplay.filter((t) => t.status === "COMPLETED");
  const pendingCount = pendingSyncItems ? pendingSyncItems.length : 0;

  return (
    <div className="space-y-4">
      {/* Network & Offline Status Banner */}
      <div className="flex items-center justify-between text-xs p-2.5 rounded-lg border bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-mono">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Online — IndexedDB Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <WifiOff className="size-3.5" />
              Offline Mode — Updates Queued in Dexie
            </span>
          )}
        </div>

        {pendingCount > 0 && (
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-mono text-[10px] gap-1"
          >
            <CloudUpload className="size-3" />
            {pendingCount} Pending Sync
          </Badge>
        )}
      </div>

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
            className="text-xs gap-1.5 h-9 cursor-pointer"
            onClick={processSyncQueue}
            disabled={isSyncing || !isOnline || pendingCount === 0}
          >
            <RefreshCw
              className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : pendingCount > 0 ? `Sync (${pendingCount})` : "Synced"}
          </Button>
        </div>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              <CheckCircle2 className="size-8 mx-auto text-emerald-400 mb-2" />
              <p className="font-semibold">All tasks completed!</p>
              <p className="text-xs mt-1">Great work. Sync to upload changes.</p>
            </div>
          ) : (
            activeTasks.map((t) => (
              <FieldTaskCard key={t.id} task={t} isOnline={isOnline} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No completed tasks yet.
            </div>
          ) : (
            completedTasks.map((t) => (
              <FieldTaskCard key={t.id} task={t} isOnline={isOnline} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
