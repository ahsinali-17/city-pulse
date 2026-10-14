"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Loader2,
  MapPin,
  Search,
  ShieldAlert,
} from "lucide-react";
import { assignTicket, overrideTicketSeverity, requestTicketAdminReview } from "@/app/manager/dispatch/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DispatchTicket = {
  id: string;
  title: string;
  category: string;
  severity: number;
  status: string;
  priority: string;
  address: string;
  department: string;
  departmentStatus: "ACTIVE" | "SUSPENDED" | "ARCHIVED" | null;
  departmentId: string | null;
  assignedCrewId: string | null;
  assignedCrew: string | null;
  createdAt: string;
};

type Worker = { id: string; name: string; departmentId: string | null };
type Department = { id: string; name: string };

const ACTIVE_STATUSES = ["REPORTED", "TRIAGED", "ASSIGNED", "DISPATCHED", "EN_ROUTE", "ON_SITE", "IN_PROGRESS"];
const PRIORITY_STYLES: Record<string, string> = {
  URGENT: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  HIGH: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  NORMAL: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  LOW: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};
const PRIORITY_ORDER: Record<string, number> = { LOW: 1, NORMAL: 2, HIGH: 3, URGENT: 4 };

export function DispatchBoard({
  tickets,
  workers,
  departments,
  isAdmin = false,
}: {
  tickets: DispatchTicket[];
  workers: Worker[];
  departments: Department[];
  isAdmin?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [sortUrgentFirst, setSortUrgentFirst] = useState(true);
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tickets
      .filter((ticket) => status === "ALL" || ticket.status === status)
      .filter((ticket) => department === "ALL" || ticket.departmentId === department)
      .filter((ticket) => !normalizedQuery || [ticket.id, ticket.title, ticket.address].some((value) => value.toLowerCase().includes(normalizedQuery)))
      .sort((a, b) => sortUrgentFirst
        ? (PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]) || (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [department, query, sortUrgentFirst, status, tickets]);

  const unassignedCount = tickets.filter((ticket) => !ticket.assignedCrewId).length;
  const urgentCount = tickets.filter((ticket) => ticket.priority === "URGENT").length;
  const inProgressCount = tickets.filter((ticket) => ["EN_ROUTE", "ON_SITE", "IN_PROGRESS"].includes(ticket.status)).length;

  const runAction = (ticketId: string, action: () => Promise<void>) => {
    setError("");
    setPendingTicketId(ticketId);
    startTransition(async () => {
      try {
        await action();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "Dispatch update failed.");
      } finally {
        setPendingTicketId((current) => (current === ticketId ? null : current));
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-end">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Operations control</p>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"><ClipboardList className="size-6 text-blue-600" /> Ticket Dispatch</h1>
          <p className="mt-1 text-sm text-muted-foreground">Route active incidents to field crews and keep department queues moving.</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-300"><CheckCircle2 className="size-3.5" /> Live queue</Badge>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric icon={ClipboardList} label="Active tickets" value={tickets.length} />
        <Metric icon={ShieldAlert} label="Needs dispatch" value={unassignedCount} tone="amber" />
        <Metric icon={AlertTriangle} label="Urgent" value={urgentCount} tone="red" />
        <Metric icon={HardHat} label="In field" value={inProgressCount} tone="blue" />
      </div>

      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ticket, title, or address" className="pl-9" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm"><option value="ALL">All active statuses</option>{ACTIVE_STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm"><option value="ALL">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSortUrgentFirst((value) => !value)}><ArrowDownUp className="size-3.5" /> {sortUrgentFirst ? "Priority first" : "Oldest first"}</Button>
        </CardContent>
      </Card>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-muted-foreground dark:border-slate-800 dark:bg-slate-900/70">
              <tr><th className="px-4 py-3">Incident</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Field worker</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.map((ticket) => <DispatchRow key={ticket.id} ticket={ticket} workers={workers} isPending={isPending && pendingTicketId === ticket.id} runAction={runAction} isAdmin={isAdmin} />)}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && <div className="px-6 py-14 text-center text-sm text-muted-foreground">No active tickets match these filters.</div>}
      </div>
      <p className="text-xs text-muted-foreground">Showing {filteredTickets.length} of {tickets.length} active tickets. Unassigned rows include tickets whose former crew account was removed and need reassignment.</p>
    </div>
  );
}

function DispatchRow({ ticket, workers, isPending, runAction, isAdmin }: { ticket: DispatchTicket; workers: Worker[]; isPending: boolean; runAction: (ticketId: string, action: () => Promise<void>) => void; isAdmin: boolean }) {
  const [workerId, setWorkerId] = useState(ticket.assignedCrewId || "NONE");
  const [severity, setSeverity] = useState(String(ticket.severity));
  const isUnassigned = !ticket.assignedCrewId;
  const isDepartmentUnavailable = ticket.departmentStatus === "SUSPENDED" || ticket.departmentStatus === "ARCHIVED";
  const canOverrideDepartment = isDepartmentUnavailable && isAdmin;
  const matchingWorkers = workers.filter((worker) => ticket.departmentId !== null && worker.departmentId === ticket.departmentId);

  return (
    <tr className={isDepartmentUnavailable ? "bg-slate-100/80 text-slate-500 dark:bg-slate-900/70 dark:text-slate-400" : isUnassigned ? "bg-amber-50/40 dark:bg-amber-950/10" : "hover:bg-slate-50/60 dark:hover:bg-slate-900/40"}>
      <td className="px-4 py-4"><div className="flex items-start gap-3"><div className={`mt-0.5 size-2 rounded-full ${ticket.priority === "URGENT" ? "bg-red-500" : "bg-blue-500"}`} /><div><div className="flex items-center gap-2"><span className="font-mono text-[11px] text-muted-foreground">{ticket.id}</span><Badge variant="outline" className={`text-[10px] ${PRIORITY_STYLES[ticket.priority]}`}>{ticket.priority}</Badge></div><p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{ticket.address}</p></div></div></td>
      <td className="px-4 py-4"><Badge variant="secondary" className="whitespace-nowrap text-[10px]">{ticket.status.replaceAll("_", " ")}</Badge></td>
      <td className="px-4 py-4"><div className="flex items-center gap-2"><select aria-label={`Severity for ${ticket.id}`} value={severity} onChange={(event) => setSeverity(event.target.value)} disabled={isPending || (!isAdmin && isDepartmentUnavailable)} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select><Button variant="ghost" size="sm" className="h-8 px-2 text-[11px]" disabled={isPending || (!isAdmin && isDepartmentUnavailable) || severity === String(ticket.severity)} onClick={() => runAction(ticket.id, () => overrideTicketSeverity(ticket.id, Number(severity)))}>Save</Button></div></td>
      <td className="px-4 py-4 text-xs text-muted-foreground"><div className="flex flex-wrap items-center gap-2"><span>{ticket.department}</span>{ticket.departmentStatus && ticket.departmentStatus !== "ACTIVE" && <Badge variant="outline" className="border-slate-300 bg-slate-200 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{ticket.departmentStatus}</Badge>}</div></td>
      <td className="px-4 py-4"><select aria-label={`Worker for ${ticket.id}`} value={workerId} onChange={(event) => setWorkerId(event.target.value)} disabled={isPending || (!isAdmin && isDepartmentUnavailable)} className="h-8 max-w-47.5 rounded-md border border-input bg-background px-2 text-xs"><option value="NONE">Needs assignment</option>{matchingWorkers.map((worker) => <option key={worker.id} value={worker.id}>{worker.name}</option>)}</select></td>
      <td className="px-4 py-4 text-right"><div className="flex flex-wrap justify-end gap-2"><Button size="sm" className="gap-1.5" disabled={isPending || (!isAdmin && isDepartmentUnavailable) || workerId === (ticket.assignedCrewId || "NONE")} onClick={() => runAction(ticket.id, () => assignTicket(ticket.id, workerId === "NONE" ? null : workerId))}>{isPending ? <Loader2 className="size-3.5 animate-spin" /> : <HardHat className="size-3.5" />}{isDepartmentUnavailable ? (isAdmin ? "Override" : "Review") : isUnassigned ? "Dispatch" : "Reassign"}</Button>{!isAdmin && !isDepartmentUnavailable && isUnassigned && ["REPORTED", "TRIAGED"].includes(ticket.status) && <Button variant="outline" size="sm" className="gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30" disabled={isPending} onClick={() => runAction(ticket.id, () => requestTicketAdminReview(ticket.id))}><ShieldAlert className="size-3.5" /> Request review</Button>}</div></td>
    </tr>
  );
}

function Metric({ icon: Icon, label, value, tone = "slate" }: { icon: React.ElementType; label: string; value: number; tone?: string }) {
  const tones: Record<string, string> = { slate: "text-slate-700 dark:text-slate-200", amber: "text-amber-700 dark:text-amber-300", red: "text-red-700 dark:text-red-300", blue: "text-blue-700 dark:text-blue-300" };
  return <Card className="border-slate-200 shadow-sm dark:border-slate-800"><CardContent className="p-4"><Icon className={`mb-2 size-4 ${tones[tone]}`} /><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${tones[tone]}`}>{value}</p></CardContent></Card>;
}