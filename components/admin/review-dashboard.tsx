"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FolderClock,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assignTicketDepartment, bulkAssignTicketDepartments, correctTicketRoute } from "@/app/admin/review/actions";

type ReviewTicket = {
  id: string;
  title: string;
  department: string;
  status: string;
  priority: string;
  eta: string;
  imageUrl?: string | null;
  aiConfidence?: number | null;
};

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <ShieldAlert className="size-3.5" /> Review Queue
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Review Dashboard</h1>
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

        <TabsContent value="suspended" className="space-y-4">
          {suspendedTickets.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">No suspended-department tickets are awaiting review.</CardContent>
            </Card>
          ) : (
            suspendedTickets.map((ticket) => (
              <Card key={ticket.id} className="border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 uppercase">
                          {ticket.id}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {ticket.department}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{ticket.status}</span>
                        <span>•</span>
                        <span>{ticket.priority} priority</span>
                        <span>•</span>
                        <span>{ticket.eta}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-950/40">
                              <TriangleAlert className="mr-2 size-4" /> Freeze & Notify
                            </Button>
                          }
                        />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Freeze and notify this department?</DialogTitle>
                            <DialogDescription>
                              This suspended department ticket will be held for admin attention and the manager will be notified.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-amber-600 text-white hover:bg-amber-700">Confirm Freeze</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Link
                        href={`/manager/dispatch?ticketId=${ticket.id}`}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-slate-900 px-2.5 text-sm font-medium whitespace-nowrap text-white transition-all hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        Act as Manager (Assign)
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Archived department reroute queue</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bulk reassignment for orphaned archive tickets.</p>
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
                  <Card key={ticket.id} className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 uppercase">
                              {ticket.id}
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {ticket.department}
                            </Badge>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span>{ticket.status}</span>
                            <span>•</span>
                            <span>{ticket.priority} priority</span>
                            <span>•</span>
                            <span>{ticket.eta}</span>
                          </div>
                        </div>

                        <div className="flex w-full max-w-xs gap-2">
                          <Select
                            value={archivedSelection[ticket.id] ?? ""}
                            onValueChange={(value) => setArchivedSelection((prev) => ({ ...prev, [ticket.id]: value || "" }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select active department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            disabled={isPending || !archivedSelection[ticket.id]}
                            onClick={() => runAction(ticket.id, () => assignTicketDepartment(ticket.id, archivedSelection[ticket.id]))}
                          >
                            {pendingTicketId === ticket.id ? "Saving..." : "Assign"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          {aiTickets.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">No tickets need AI or manager routing review.</CardContent>
            </Card>
          ) : (
            aiTickets.map((ticket) => (
              <Card key={ticket.id} className="border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/20">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200 uppercase">
                          {ticket.id}
                        </Badge>
                        <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-200">
                          {ticket.department}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>AI confidence {ticket.aiConfidence?.toFixed(2) ?? "n/a"}</span>
                        <span>•</span>
                        <span>{ticket.priority} priority</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {ticket.imageUrl && (
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button variant="outline" className="border-violet-300 text-violet-800 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/40">
                                <Camera className="mr-2 size-4" /> View Image
                              </Button>
                            }
                          />
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{ticket.title}</DialogTitle>
                              <DialogDescription>Image evidence associated with the routing review.</DialogDescription>
                            </DialogHeader>
                            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                              <img src={ticket.imageUrl} alt={ticket.title} className="h-105 w-full object-cover" />
                            </div>
                            <DialogFooter>
                              <Button variant="outline">Close</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      <div className="w-full min-w-45 sm:w-55">
                        <Select
                          value={aiSelection[ticket.id] ?? ""}
                          onValueChange={(value) => setAiSelection((prev) => ({ ...prev, [ticket.id]: value || "" }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select correct department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        className="bg-violet-600 text-white hover:bg-violet-700"
                        disabled={isPending || !aiSelection[ticket.id]}
                        onClick={() => runAction(ticket.id, () => correctTicketRoute(ticket.id, aiSelection[ticket.id]))}
                      >
                        {pendingTicketId === ticket.id ? "Saving..." : "Confirm Route"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
