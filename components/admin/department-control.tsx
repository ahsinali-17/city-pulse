"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Archive, Building2, LockKeyhole, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { archiveDepartment, createDepartment, reactivateDepartment, suspendDepartment, unsuspendDepartment } from "@/app/admin/departments/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Department = {
  id: string;
  name: string;
  description: string | null;
  status: "SUSPENDED" | "ACTIVE" | "ARCHIVED";
  statusReason: string | null;
  managerAssignedAt: string | null;
  manager: { id: string; name: string; email: string } | null;
};

type Worker = { id: string; name: string; email: string; departmentId: string | null };

const statusStyles: Record<Department["status"], string> = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  SUSPENDED: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  ARCHIVED: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};

export function DepartmentControl({ departments, availableWorkers }: { departments: Department[]; availableWorkers: Worker[] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const run = (action: () => Promise<void>) => {
    setError("");
    startTransition(async () => {
      try { await action(); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Department update failed."); }
    });
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    run(async () => {
      await createDepartment(name, description);
      setName("");
      setDescription("");
    });
  };

  const activeCount = departments.filter((department) => department.status === "ACTIVE").length;
  const suspendedCount = departments.filter((department) => department.status === "SUSPENDED").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-end">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Administration</p><h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"><Building2 className="size-6 text-indigo-600" /> Department Control</h1><p className="mt-1 text-sm text-muted-foreground">Manage operational ownership without mixing department work into staff records.</p></div>
        <Badge variant="outline" className="w-fit gap-1.5"><ShieldCheck className="size-3.5" /> Admin only</Badge>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Metric label="Total departments" value={departments.length} />
        <Metric label="Operational" value={activeCount} tone="green" />
        <Metric label="Needs manager" value={suspendedCount} tone="amber" />
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertTriangle className="size-4" />{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Plus className="size-4 text-indigo-600" /> Create department</CardTitle>
          <CardDescription>New departments start suspended until a manager is assigned to them.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1.5fr_auto]">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Department name" disabled={isPending} />
          <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Responsibility description (required)" disabled={isPending} required />
          <Button onClick={handleCreate} disabled={isPending || !name.trim() || description.trim().length < 10}><Plus className="mr-1.5 size-4" />Create</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {departments.map((department) => <DepartmentRow key={department.id} department={department} availableWorkers={availableWorkers} isPending={isPending} run={run} />)}
      </div>
    </div>
  );
}

function DepartmentRow({ department, isPending, run }: { department: Department; availableWorkers: Worker[]; isPending: boolean; run: (action: () => Promise<void>) => void }) {
  return <Card className={department.status === "SUSPENDED" ? "border-amber-200 dark:border-amber-900" : undefined}>
    <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{department.name}</h2>
          <Badge variant="outline" className={`text-[10px] ${statusStyles[department.status]}`}>{department.status}</Badge>
          {department.status === "SUSPENDED" && department.statusReason && <span className="text-[11px] text-muted-foreground">{department.statusReason.replaceAll("_", " ")}</span>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{department.description || "No responsibility description yet."}</p>
        <p className="mt-2 text-xs text-muted-foreground">{department.manager ? <>Manager: <span className="font-medium text-slate-700 dark:text-slate-300">{department.manager.name}</span> <span className="font-mono">({department.manager.email})</span></> : "No manager assigned"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        {department.status === "ACTIVE" && <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => suspendDepartment(department.id))}><LockKeyhole className="mr-1.5 size-3.5" />Suspend</Button>}
        {department.status === "SUSPENDED" && department.statusReason === "ADMIN_DISABLED" && (
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => unsuspendDepartment(department.id))}><RotateCcw className="mr-1.5 size-3.5" />Unsuspend</Button>
        )}
        {department.status === "SUSPENDED" && (department.statusReason === "NO_MANAGER" || department.statusReason === "MANAGER_DEACTIVATED") && (
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Appoint a manager</span>
        )}
        {department.status === "ARCHIVED" && <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => reactivateDepartment(department.id))}><RotateCcw className="mr-1.5 size-3.5" />Reactivate</Button>}
        {department.status !== "ARCHIVED" && <Button variant="ghost" size="sm" disabled={isPending} onClick={() => run(() => archiveDepartment(department.id))}><Archive className="mr-1.5 size-3.5" />Archive</Button>}
      </div>
    </CardContent>
  </Card>;
}

function Metric({ label, value, tone = "slate" }: { label: string; value: number; tone?: "slate" | "green" | "amber" }) {
  const colors = { slate: "text-slate-900 dark:text-slate-100", green: "text-emerald-700 dark:text-emerald-300", amber: "text-amber-700 dark:text-amber-300" };
  return <Card><CardContent className="p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-bold ${colors[tone]}`}>{value}</p></CardContent></Card>;
}