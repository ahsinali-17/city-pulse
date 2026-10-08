"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  MapPin,
  DeleteIcon,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PdfDownloadButton } from "@/components/pdf-download-button";

export interface AdminTicket {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  severity: number;
  address: string;
  createdAt: string; // ISO string
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

export function AdminDashboardClient({ allTickets }: { allTickets: AdminTicket[] }) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [recencyDays, setRecencyDays] = useState(0);

  const filteredTickets = useMemo(() => {
    const now = Date.now();
    return allTickets.filter((t) => {
      if (categoryFilter !== "All" && !t.category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        return false;
      }
      if (severityFilter !== "All" && t.severity !== Number(severityFilter)) {
        return false;
      }
      if (recencyDays > 0) {
        const ticketAge = now - new Date(t.createdAt).getTime();
        if (ticketAge > recencyDays * 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [allTickets, categoryFilter, severityFilter, recencyDays]);

  const totalTickets = filteredTickets.length;
  const resolvedTickets = filteredTickets.filter((t) => t.status === "RESOLVED").length;
  const inProgressTickets = filteredTickets.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "ON_SITE" || t.status === "EN_ROUTE"
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

  const hasActiveFilters = categoryFilter !== "All" || severityFilter !== "All" || recencyDays > 0;

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
      <Card className="shadow-sm">
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
            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Hazard Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Severity Level
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s === "All" ? "All Severities" : `${s}`}</option>
                ))}
              </select>
            </div>

            {/* Recency Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Time Period
              </label>
              <select
                value={recencyDays}
                onChange={(e) => setRecencyDays(Number(e.target.value))}
                className="block w-44 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {RECENCY_OPTIONS.map((opt) => (
                  <option key={opt.days} value={opt.days}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <div className="flex items-end justify-center my-1 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter("All");
                    setSeverityFilter("All");
                    setRecencyDays(0);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalTickets}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {resolvedTickets}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Active / En Route
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {inProgressTickets}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="size-3.5" /> Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">
              {urgentTickets}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Table */}
      <Card className="shadow-sm overflow-hidden">
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
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
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
