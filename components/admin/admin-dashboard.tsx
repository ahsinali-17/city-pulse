"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowUpRight,
  Filter,
  MapPin,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { AdminDashboardKpis } from "./dashboard/admin-dashboard-kpis";
import { AdminDepartmentProgress } from "./dashboard/admin-department-progress";

export interface AdminTicket {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  severity: number;
  address: string;
  departmentId: string | null;
  departmentName: string;
  createdAt: string;
}

const CATEGORIES = ["All", "Water", "Road", "Electrical", "Gas", "Sewer", "Other"];
const SEVERITIES = ["All", "1", "2", "3", "4", "5"];
const RECENCY_OPTIONS = [
  { label: "All Time", days: 0 },
  { label: "Last 24 Hours", days: 1 },
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];
const WORKFLOW_OPTIONS = [
  { label: "All Workflows", value: "ALL" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Resolved", value: "RESOLVED" },
];
const RESOLVED_STATUSES = ["RESOLVED", "COMPLETED"];

export function AdminDashboardClient({ allTickets }: { allTickets: AdminTicket[] }) {
  const [currentTime] = useState(() => Date.now());
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [recencyDays, setRecencyDays] = useState(0);
  const [workflowFilter, setWorkflowFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");

  const departmentOptions = useMemo(() => {
    const uniqueDepartments = new Map<string, string>();
    allTickets.forEach((ticket) => uniqueDepartments.set(ticket.departmentId ?? "UNASSIGNED", ticket.departmentName));
    return [...uniqueDepartments.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [allTickets]);

  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      if (categoryFilter !== "All" && !t.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      if (severityFilter !== "All" && t.severity !== Number(severityFilter)) {
        return false;
      }
      if (workflowFilter === "RESOLVED" && !RESOLVED_STATUSES.includes(t.status)) return false;
      if (workflowFilter === "ONGOING" && RESOLVED_STATUSES.includes(t.status)) return false;
      if (departmentFilter !== "ALL" && (t.departmentId ?? "UNASSIGNED") !== departmentFilter) return false;
      if (recencyDays > 0) {
        const ticketAge = currentTime - new Date(t.createdAt).getTime();
        if (ticketAge > recencyDays * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [allTickets, categoryFilter, currentTime, departmentFilter, recencyDays, severityFilter, workflowFilter]);

  const totalTickets = filteredTickets.length;
  const resolvedTickets = filteredTickets.filter((t) => RESOLVED_STATUSES.includes(t.status)).length;
  const inProgressTickets = filteredTickets.filter(
    (t) => !RESOLVED_STATUSES.includes(t.status)
  ).length;
  const urgentTickets = filteredTickets.filter((t) => t.priority === "URGENT").length;

  const reportData = {
    totalTickets,
    resolvedTickets,
    inProgressTickets,
    urgentTickets,
    generationDate: new Date().toLocaleDateString(),
    tickets: filteredTickets.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      severity: t.severity,
      location: t.address,
    })),
  };

  const departmentProgress = useMemo(() => {
    const grouped = new Map<string, { name: string; ongoing: number; resolved: number }>();
    filteredTickets.forEach((ticket) => {
      const key = ticket.departmentId ?? "UNASSIGNED";
      const current = grouped.get(key) ?? { name: ticket.departmentName, ongoing: 0, resolved: 0 };
      if (RESOLVED_STATUSES.includes(ticket.status)) current.resolved++;
      else current.ongoing++;
      grouped.set(key, current);
    });
    return [...grouped.values()].sort((a, b) => (b.ongoing + b.resolved) - (a.ongoing + a.resolved));
  }, [filteredTickets]);

  const hasActiveFilters =
    categoryFilter !== "All" ||
    severityFilter !== "All" ||
    recencyDays > 0 ||
    workflowFilter !== "ALL" ||
    departmentFilter !== "ALL";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="size-6 text-indigo-600 dark:text-indigo-400" />
            Executive Audit Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide infrastructure repair metrics and compliance reporting.
          </p>
        </div>
        <PdfDownloadButton data={reportData} disabled={totalTickets === 0} />
      </div>

      {/* Filters */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="size-4 text-indigo-500" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-[10px] ml-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hazard Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Severity Level
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Severities" : `${s}`}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Time Period
              </label>
              <select
                value={recencyDays}
                onChange={(e) => setRecencyDays(Number(e.target.value))}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {RECENCY_OPTIONS.map((opt) => (
                  <option key={opt.days} value={opt.days}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Workflow
              </label>
              <select
                value={workflowFilter}
                onChange={(e) => setWorkflowFilter(e.target.value)}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {WORKFLOW_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="block w-52 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end justify-center my-1 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter("All");
                    setSeverityFilter("All");
                    setRecencyDays(0);
                    setWorkflowFilter("ALL");
                    setDepartmentFilter("ALL");
                  }}
                  className="text-xs text-muted-foreground hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={12} className="mr-1" />
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <AdminDashboardKpis
        totalTickets={totalTickets}
        resolvedTickets={resolvedTickets}
        inProgressTickets={inProgressTickets}
        urgentTickets={urgentTickets}
      />

      {/* Department Progress */}
      <AdminDepartmentProgress departmentProgress={departmentProgress} />

      {/* Incident Table */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle>Incident Log</CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? `Showing ${filteredTickets.length} of ${allTickets.length} incidents matching your filters.`
              : `All ${allTickets.length} infrastructure hazards currently logged in the system.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticket ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Created Date</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {ticket.id.substring(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {ticket.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-semibold ${ticket.priority === "URGENT" ? "text-red-600 dark:text-red-400" : ""}`}>
                          {ticket.priority}
                        </span>
                        <span className="text-muted-foreground">Sev {ticket.severity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-50 truncate">
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {ticket.departmentName}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-40 truncate">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {ticket.address}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/citizen/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        View <ArrowUpRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No incidents match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
