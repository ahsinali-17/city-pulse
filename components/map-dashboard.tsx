"use client";

import { useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  Filter,
  HardHat,
  MapPin,
  Radio,
  Users,
} from "lucide-react";
import { MOCK_MAP_INCIDENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEVERITY_COLORS: Record<number, string> = {
  5: "#ef4444",
  4: "#f59e0b",
  3: "#eab308",
  2: "#3b82f6",
  1: "#22c55e",
};

const SEVERITY_LABELS: Record<number, string> = {
  5: "Critical",
  4: "High",
  3: "Moderate",
  2: "Low",
  1: "Minor",
};

export default function MapDashboard() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredIncidents = useMemo(() => {
    return MOCK_MAP_INCIDENTS.filter((inc) => {
      if (categoryFilter !== "all" && inc.category !== categoryFilter) return false;
      if (severityFilter !== "all" && inc.severity !== Number(severityFilter)) return false;
      return true;
    });
  }, [categoryFilter, severityFilter]);

  const stats = useMemo(() => {
    const bySeverity: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byCategory: Record<string, number> = {};

    MOCK_MAP_INCIDENTS.forEach((inc) => {
      bySeverity[inc.severity]++;
      byCategory[inc.category] = (byCategory[inc.category] || 0) + 1;
    });

    return {
      total: MOCK_MAP_INCIDENTS.length,
      filtered: filteredIncidents.length,
      bySeverity,
      byCategory,
      activeCrews: new Set(
        MOCK_MAP_INCIDENTS.filter((i) => i.assignedCrew).map((i) => i.assignedCrew)
      ).size,
    };
  }, [filteredIncidents]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-xs gap-1.5 font-mono"
          >
            <Radio className="size-3 text-emerald-500 animate-pulse" />
            Live Map Feed
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Showing{" "}
            <strong className="text-slate-900 dark:text-slate-100">
              {filteredIncidents.length}
            </strong>{" "}
            of {stats.total} incidents
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground hidden sm:block" />
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val ?? "all")}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Categories</SelectItem>
              <SelectItem value="Water Leak" className="text-xs">Water Leak</SelectItem>
              <SelectItem value="Pothole" className="text-xs">Pothole</SelectItem>
              <SelectItem value="Power Outage" className="text-xs">Power Outage</SelectItem>
              <SelectItem value="Traffic Signal" className="text-xs">Traffic Signal</SelectItem>
              <SelectItem value="Tree Branch" className="text-xs">Tree Branch</SelectItem>
              <SelectItem value="Sanitation" className="text-xs">Sanitation</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val ?? "all")}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Severities</SelectItem>
              <SelectItem value="5" className="text-xs">🔴 Critical (5)</SelectItem>
              <SelectItem value="4" className="text-xs">🟠 High (4)</SelectItem>
              <SelectItem value="3" className="text-xs">🟡 Moderate (3)</SelectItem>
              <SelectItem value="2" className="text-xs">🔵 Low (2)</SelectItem>
              <SelectItem value="1" className="text-xs">🟢 Minor (1)</SelectItem>
            </SelectContent>
          </Select>

          {(categoryFilter !== "all" || severityFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => {
                setCategoryFilter("all");
                setSeverityFilter("all");
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md min-h-125">
        <MapContainer
          center={[40.733, -73.992]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredIncidents.map((incident) => (
            <CircleMarker
              key={incident.id}
              center={[incident.coordinates.lat, incident.coordinates.lng]}
              radius={incident.severity >= 5 ? 12 : incident.severity >= 4 ? 10 : 8}
              pathOptions={{
                color: SEVERITY_COLORS[incident.severity],
                fillColor: SEVERITY_COLORS[incident.severity],
                fillOpacity: 0.7,
                weight: 2,
                opacity: 0.9,
              }}
            >
              <Popup maxWidth={280} minWidth={220}>
                <div className="space-y-2 p-0.5">
                  {/* Popup Header: ID + Severity */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {incident.id}
                    </span>
                    <span
                      className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
                    >
                      Sev {incident.severity}/5
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {incident.title}
                  </h3>

                  {/* Address */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <MapPin className="size-3 shrink-0" />
                    {incident.address}
                  </div>

                  {/* Category + Status Row */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                    <span className="text-slate-500">
                      {incident.category} • {incident.reportedAt}
                    </span>
                    <span
                      className="font-mono font-semibold px-1.5 py-0.5 rounded text-[10px]"
                      style={{
                        backgroundColor:
                          incident.status === "RESOLVED"
                            ? "#d1fae5"
                            : incident.status === "IN_PROGRESS"
                            ? "#fef3c7"
                            : "#e0e7ff",
                        color:
                          incident.status === "RESOLVED"
                            ? "#065f46"
                            : incident.status === "IN_PROGRESS"
                            ? "#92400e"
                            : "#3730a3",
                      }}
                    >
                      {incident.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Assigned Crew */}
                  {incident.assignedCrew && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium">
                      <HardHat className="size-3 shrink-0" />
                      {incident.assignedCrew}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Stats Overlay Panel — Top Left (hidden on mobile) */}
        <div className="absolute top-4 left-4 z-1000 w-60 hidden md:block">
          <div className="civic-glass rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="size-3.5 text-blue-600" />
                Incident Overview
              </h3>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                {stats.total}
              </span>
            </div>

            {/* Severity Breakdown Bars */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                By Severity
              </span>
              {[5, 4, 3, 2, 1].map((sev) => (
                <div key={sev} className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 w-14">
                    {SEVERITY_LABELS[sev]}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: SEVERITY_COLORS[sev],
                        width: `${Math.max((stats.bySeverity[sev] / stats.total) * 100, 4)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 w-4 text-right">
                    {stats.bySeverity[sev]}
                  </span>
                </div>
              ))}
            </div>

            {/* Category Breakdown */}
            <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                By Category
              </span>
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300 truncate">{cat}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                      {count}
                    </span>
                  </div>
                ))}
            </div>

            {/* Active Crews */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Users className="size-3" /> Active Crews
              </span>
              <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                {stats.activeCrews}
              </span>
            </div>
          </div>
        </div>

        {/* Severity Legend — Bottom Right */}
        <div className="absolute bottom-4 right-4 z-1000">
          <div className="civic-glass rounded-lg border border-slate-200/70 dark:border-slate-700 shadow-md px-3 py-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Severity
            </span>
            <div className="flex items-center gap-3">
              {[5, 4, 3, 2, 1].map((sev) => (
                <div key={sev} className="flex items-center gap-1">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[sev] }}
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                    {sev}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
