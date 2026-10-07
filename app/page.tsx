import Link from "next/link";
import {
  ShieldAlert,
  PlusCircle,
  Ticket,
  HardHat,
  MapPin,
  SlidersHorizontal,
  BarChart3,
  UserPlus,
  ArrowRight,
  Sparkles,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const personas = [
    {
      title: "Citizen Hazard Reporter",
      role: "Public Access",
      description: "Submit local issues (potholes, leaks, outages) with camera photo & GPS. Powered by Gemini AI vision analysis.",
      icon: PlusCircle,
      color: "border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
      links: [
        { label: "Report New Hazard", href: "/citizen/new", icon: PlusCircle },
        { label: "Track Ticket Status", href: "/citizen/tickets", icon: Ticket },
      ] as Array<{ label: string; href: string; icon: React.ElementType; badge?: string }>,
    },
    {
      title: "Field Worker Mobile PWA",
      role: "Municipal Crew",
      description: "Offline-first PWA for field technicians. View task queues, log inventory parts, and update ticket statuses offline.",
      icon: HardHat,
      color: "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
      links: [
        { label: "Open Offline Task Queue", href: "/field", icon: HardHat, badge: "IndexedDB Sync" },
      ],
    },
    {
      title: "GIS Incident Command",
      role: "Dispatcher / Manager",
      description: "Desktop geospatial dashboard to monitor incident clusters, override AI severity scores, and dispatch field crews.",
      icon: MapPin,
      color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
      links: [
        { label: "View GIS Heatmap", href: "/manager/map", icon: MapPin },
        { label: "Dispatch Workbench", href: "/manager/dispatch", icon: SlidersHorizontal },
      ],
    },
    {
      title: "Executive Audit Hub",
      role: "City Admin",
      description: "System-wide analytics, cross-department resolution metrics, user onboarding, and PDF compliance export.",
      icon: BarChart3,
      color: "border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300",
      btnClass: "bg-purple-600 hover:bg-purple-700 text-white",
      links: [
        { label: "Executive Analytics", href: "/admin", icon: BarChart3 },
        { label: "Staff Onboarding", href: "/admin/users", icon: UserPlus },
      ],
    },
  ];

  const recentIncidents = [
    { id: "HAZ-8902", type: "Water Main Leak", location: "452 Elm Street", severity: 5, status: "DISPATCHED", time: "10m ago" },
    { id: "HAZ-8899", type: "Severe Pothole", location: "78 Grand Avenue", severity: 4, status: "IN_PROGRESS", time: "25m ago" },
    { id: "HAZ-8894", type: "Damaged Traffic Light", location: "Route 9 & Broadway", severity: 5, status: "TRIAGED", time: "42m ago" },
    { id: "HAZ-8891", type: "Fallen Tree Branch", location: "Oak Park Pathway", severity: 2, status: "RESOLVED", time: "1h ago" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/40 gap-1 text-xs">
              <Sparkles className="size-3.5" /> AI Gemini Vision Triage Active
            </Badge>
            <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-400/40 gap-1 text-xs">
              <WifiOff className="size-3.5" /> PWA Offline Caching Ready
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            CityPulse Infrastructure Triage & Dispatch Hub
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Connecting citizen hazard reports directly to municipal repair crews through automated AI assessment, real-time GIS spatial tracking, and offline-first field synchronization.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Button   className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg">
              <Link href="/citizen/new" className="inline-flex items-center gap-2 whitespace-nowrap">
                <PlusCircle className="size-4 shrink-0" />
                <span>Report New Hazard</span>
              </Link>
            </Button>
            <Button   variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800 hover:text-white">
              <Link href="/manager/map" className="inline-flex items-center gap-2 whitespace-nowrap">
                <MapPin className="size-4 text-emerald-400 shrink-0" />
                <span>View GIS Live Map</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Graphic Elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-transparent pointer-events-none hidden md:block" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Tickets</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">142</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="size-3 shrink-0" /> 28 resolved today
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Layers className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">High Severity (4-5)</p>
              <h3 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-1 font-mono">18</h3>
              <p className="text-[10px] sm:text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5 flex items-center gap-1">
                <AlertTriangle className="size-3 shrink-0" /> Urgent dispatch
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl shrink-0">
              <AlertTriangle className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Field Crews Active</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">12</h3>
              <p className="text-[10px] sm:text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                <HardHat className="size-3 shrink-0" /> 4 Teams Offline
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <HardHat className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Resolution</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono">3.4 hrs</h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <Clock className="size-3 shrink-0" /> -18% vs target
              </p>
            </div>
            <div className="p-2.5 sm:p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <Clock className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Navigation Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Application Modules & Role Workflows
            </h2>
            <p className="text-xs text-muted-foreground">Select a persona workflow to preview vertical slices</p>
          </div>
          <Badge variant="outline" className="font-mono text-xs">Phase 1 Slice 1</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <Card key={index} className={`border ${persona.color} transition-all hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-inherit shrink-0">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold">{persona.title}</CardTitle>
                        <CardDescription className="text-xs font-medium font-mono text-slate-600 dark:text-slate-400">
                          {persona.role}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {persona.description}
                  </p>

                  <div className="pt-2 border-t border-inherit/40 space-y-2">
                    {persona.links.map((link, idx) => {
                      const LinkIcon = link.icon;
                      return (
                        <Link
                          key={idx}
                          href={link.href}
                          className="flex items-center justify-between p-2 rounded-md bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors border border-slate-200/50 dark:border-slate-800/50 group"
                        >
                          <span className="flex items-center gap-2">
                            <LinkIcon className="size-4 text-slate-500 group-hover:text-blue-600 transition-colors shrink-0" />
                            {link.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Static Mock Incident Feed preview */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <ShieldAlert className="size-4 text-blue-600 shrink-0" />
              <span>Recent Triage Incidents <span className="text-muted-foreground font-normal text-xs sm:text-sm">(Static Mock Data)</span></span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">Live stream of triaged reports awaiting dispatch</CardDescription>
          </div>
          <Button variant="outline" size="sm"   className="text-xs shrink-0 self-start sm:self-auto">
            <Link href="/manager/dispatch" className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>View All</span>
              <ArrowRight className="size-3 shrink-0" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="p-3 sm:px-6 flex flex-col xs:flex-row xs:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-xs">
                <div className="flex items-center gap-2.5">
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] shrink-0 ${
                      incident.severity >= 5
                        ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-400"
                        : incident.severity >= 4
                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400"
                    }`}
                  >
                    Sev {incident.severity}/5
                  </Badge>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{incident.type}</span>
                    <span className="text-muted-foreground ml-1.5 text-[11px] truncate inline-block max-w-35 xs:max-w-none align-bottom">({incident.location})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end xs:self-auto">
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {incident.status}
                  </Badge>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono">{incident.time}</span>
                </div>
              </div>
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
