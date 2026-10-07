import Link from "next/link";
import {
  ArrowLeft,
  HardHat,
  Radio,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FieldTaskList } from "@/components/field-task/field-task-list";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { type FieldTask } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function FieldWorkerPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch tickets assigned to this crew member
  const assignedTickets = await db
    .select()
    .from(tickets)
    .where(
      eq(tickets.assignedCrewId, session.user.id)
    );

  const dbTasks = assignedTickets
    .filter(t => t.assignedCrewId === session.user.id || session.user.role !== "FIELD_WORKER") // fallback for demo
    .map((t) => {
      // Map valid status values to FieldTask statuses
      let mappedStatus: FieldTask["status"] = t.status === "RESOLVED" ? "COMPLETED" : t.status === "DISPATCHED" ? "ASSIGNED" : t.status as FieldTask["status"]

      return {
        id: t.id,
        title: t.title,
        category: t.category,
        severity: t.severity as 1 | 2 | 3 | 4 | 5,
        status: mappedStatus,
        address: t.address,
        coordinates: { lat: t.lat, lng: t.lng },
        estimatedMinutes: t.aiAnalysis?.estimatedMinutes || 60,
        reportedAt: new Date(t.createdAt).toLocaleDateString(),
        partsNeeded: t.partsNeeded || [],
        partsUsed: t.partsUsed || [],
        notes: t.notes || t.description || "No specific instructions provided.",
        priority: (t.priority || "NORMAL") as "URGENT" | "HIGH" | "NORMAL" | "LOW",
        imageUrl: t.imageUrl || "",
      } satisfies FieldTask;
  });

  const urgentCount = dbTasks.filter(
    (t) => t.priority === "URGENT"
  ).length;
  const totalParts = dbTasks.reduce(
    (sum, t) => sum + t.partsNeeded.length,
    0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 mb-1 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to Triage Hub
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HardHat className="size-6 text-amber-600" /> Field Task Queue
          </h1>
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs font-mono"
          >
            Crew #4 • PWA
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage field repair assignments, log inventory parts, and sync
          offline progress.
        </p>
      </div>

      {/* Sync / Connectivity Status Banner */}
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
        <CardContent className="p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
              <Radio className="size-3.5 text-emerald-500 animate-pulse" />
              Online — Real-time Sync Active
            </div>
            <span className="text-muted-foreground font-mono hidden sm:inline">
              Last sync: just now
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono gap-1"
          >
            <Smartphone className="size-3" />
            PWA Cached
          </Badge>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned
            </p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {dbTasks.length}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <AlertTriangle className="size-3" /> Urgent
            </p>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 font-mono mt-0.5">
              {urgentCount}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Parts Req.
            </p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              {totalParts}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Task List (Client Component) */}
      <FieldTaskList tasks={dbTasks} />
    </div>
  );
}
