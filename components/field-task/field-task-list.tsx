"use client";

import { useState } from "react";
import { CheckCircle2, HardHat, RefreshCw } from "lucide-react";
import { type FieldTask } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldTaskCard } from "./field-task-card";

interface FieldTaskListProps {
  tasks: FieldTask[];
}

export function FieldTaskList({ tasks }: FieldTaskListProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const activeTasks = tasks.filter((t) => t.status !== "COMPLETED");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
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
            activeTasks.map(t => <FieldTaskCard key={t.id} task={t} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No completed tasks yet.
            </div>
          ) : (
            completedTasks.map(t => <FieldTaskCard key={t.id} task={t} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
