"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  FolderClock,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  assignTicketDepartment,
  bulkAssignTicketDepartments,
  correctTicketRoute,
  freezeAndNotifyTicket,
  returnTicketToManager,
} from "@/app/admin/review/actions";
import {
  ReviewSuspendedCard,
  type ReviewTicket,
} from "./review/review-suspended-card";
import { ReviewArchivedCard } from "./review/review-archived-card";
import { ReviewAiCard } from "./review/review-ai-card";

export type { ReviewTicket };

type ReviewDepartment = { id: string; name: string };

export function AdminReviewDashboard({
  suspendedTickets,
  archivedTickets,
  aiTickets,
  departments,
}: {
  suspendedTickets: ReviewTicket[];
  archivedTickets: ReviewTicket[];
  aiTickets: ReviewTicket[];
  departments: ReviewDepartment[];
}) {
  const [archivedSelection, setArchivedSelection] = useState<Record<string, string>>({});
  const [aiSelection, setAiSelection] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAction = (ticketId: string, action: () => Promise<void>) => {
    setActionError(null);
    setPendingTicketId(ticketId);
    startTransition(async () => {
      try {
        await action();
        setArchivedSelection((previous) => ({ ...previous, [ticketId]: "" }));
        setAiSelection((previous) => ({ ...previous, [ticketId]: "" }));
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "The review action could not be completed.");
      } finally {
        setPendingTicketId(null);
      }
    });
  };

  const runBulkReroute = () => {
    const assignments = Object.entries(archivedSelection)
      .filter(([, departmentId]) => departmentId)
      .map(([ticketId, departmentId]) => ({ ticketId, departmentId }));

    setActionError(null);
    setPendingTicketId("bulk");
    startTransition(async () => {
      try {
        await bulkAssignTicketDepartments(assignments);
        setArchivedSelection({});
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "The bulk reroute could not be completed.");
      } finally {
        setPendingTicketId(null);
      }
    });
  };

  const summary = useMemo(
    () => ({
      suspended: suspendedTickets.length,
      archived: archivedTickets.length,
      aiReview: aiTickets.length,
    }),
    [archivedTickets.length, aiTickets.length, suspendedTickets.length],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-8">
      {/* Header & KPI Summary */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <ShieldAlert className="size-3.5" /> Review Queue
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Admin Review Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Route correction, department follow-up, and escalation handling for suspended or misrouted tickets.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
            <CardContent className="p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Suspended</div>
              <div className="mt-1 text-xl font-bold text-amber-600">{summary.suspended}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
            <CardContent className="p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Archived</div>
              <div className="mt-1 text-xl font-bold text-slate-600">{summary.archived}</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70">
            <CardContent className="p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">AI Review</div>
              <div className="mt-1 text-xl font-bold text-violet-600">{summary.aiReview}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="suspended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suspended" className="gap-2 text-xs sm:text-sm">
            <Building2 className="size-3.5" /> Suspended Departments
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2 text-xs sm:text-sm">
            <FolderClock className="size-3.5" /> Archived Departments
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 text-xs sm:text-sm">
            <ShieldCheck className="size-3.5" /> AI / Manager Review
          </TabsTrigger>
        </TabsList>

        {/* Suspended Departments Tab */}
        <TabsContent value="suspended" className="space-y-4">
          {suspendedTickets.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">
                No suspended-department tickets are awaiting review.
              </CardContent>
            </Card>
          ) : (
            suspendedTickets.map((ticket) => (
              <ReviewSuspendedCard
                key={ticket.id}
                ticket={ticket}
                isPending={isPending}
                isCurrentPending={pendingTicketId === ticket.id}
                onFreezeAndNotify={(id) => runAction(id, () => freezeAndNotifyTicket(id))}
              />
            ))
          )}
        </TabsContent>

        {/* Archived Departments Tab */}
        <TabsContent value="archived" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Archived department reroute queue
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bulk reassignment for orphaned archive tickets.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 text-xs"
                disabled={isPending || !Object.values(archivedSelection).some(Boolean)}
                onClick={runBulkReroute}
              >
                <CheckCircle2 className="size-3.5" />
                {pendingTicketId === "bulk" ? "Rerouting..." : "Bulk Reroute"}
              </Button>
            </div>

            <div className="space-y-4">
              {archivedTickets.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No archived-department tickets need rerouting.
                </div>
              ) : (
                archivedTickets.map((ticket) => (
                  <ReviewArchivedCard
                    key={ticket.id}
                    ticket={ticket}
                    departments={departments}
                    selectedDepartmentId={archivedSelection[ticket.id] ?? ""}
                    isPending={isPending}
                    isCurrentPending={pendingTicketId === ticket.id}
                    onDepartmentSelect={(id, deptId) =>
                      setArchivedSelection((prev) => ({ ...prev, [id]: deptId }))
                    }
                    onAssign={(id) =>
                      runAction(id, () => assignTicketDepartment(id, archivedSelection[id]))
                    }
                  />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* AI / Manager Review Tab */}
        <TabsContent value="ai" className="space-y-4">
          {aiTickets.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">
                No tickets need AI or manager routing review.
              </CardContent>
            </Card>
          ) : (
            aiTickets.map((ticket) => (
              <ReviewAiCard
                key={ticket.id}
                ticket={ticket}
                departments={departments}
                selectedDepartmentId={aiSelection[ticket.id] ?? ""}
                isPending={isPending}
                isCurrentPending={pendingTicketId === ticket.id}
                onDepartmentSelect={(id, deptId) =>
                  setAiSelection((prev) => ({ ...prev, [id]: deptId }))
                }
                onConfirmRoute={(id) =>
                  runAction(id, () =>
                    aiSelection[id] === ticket.departmentId
                      ? returnTicketToManager(id)
                      : correctTicketRoute(id, aiSelection[id])
                  )
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {actionError && (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Alert className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <Clock3 className="size-4 text-slate-600 dark:text-slate-400" />
        <AlertDescription className="text-sm text-slate-600 dark:text-slate-300">
          Review queue reflects the current live Department and Ticket state. Route corrections are recorded in the ticket event history.
        </AlertDescription>
      </Alert>
    </div>
  );
}
