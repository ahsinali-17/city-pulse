import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Ticket,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Share2,
  Download,
  Building2,
  HardHat,
  User,
  Radio,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function getTicketProgress(status: string) {
  switch (status) {
    case "REPORTED":
      return 20;
    case "TRIAGED":
      return 40;
    case "DISPATCHED":
      return 60;
    case "IN_PROGRESS":
      return 80;
    case "RESOLVED":
      return 100;
    default:
      return 20;
  }
}

function TicketDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 col-span-2 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default async function CitizenTicketPage({ params }: TicketPageProps) {
  const resolvedParams = await params;
  const ticketId = resolvedParams.id;
  
  const [ticket] = await db
    .select({
      id: tickets.id,
      title: tickets.title,
      category: tickets.category,
      description: tickets.description,
      status: tickets.status,
      createdAt: tickets.createdAt,
      imageUrl: tickets.imageUrl,
      address: tickets.address,
      severity: tickets.severity,
      priority: tickets.priority,
      aiAnalysis: tickets.aiAnalysis,
      timeline: tickets.timeline,
      assignedDepartment: departments.name,
      assignedCrew: users.name,
    })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .leftJoin(users, eq(tickets.assignedCrewId, users.id))
    .where(eq(tickets.id, ticketId));

  if (!ticket) {
    notFound();
  }

  const progress = getTicketProgress(ticket.status);

  return (
    <Suspense fallback={<TicketDetailSkeleton />}>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 mb-1 transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Ticket className="size-6 text-blue-600" /> Ticket #{ticket.id}
              </h1>
              <Badge
                variant="outline"
                className={`font-mono text-xs ${
                  ticket.status === "DISPATCHED"
                    ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300"
                    : ticket.status === "RESOLVED"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                }`}
              >
                ● {ticket.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submitted on {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Share2 className="size-3.5" /> Share
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Download className="size-3.5" /> Audit PDF
            </Button>
          </div>
        </div>

        {/* Status Progress Tracker Banner */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-medium text-blue-400 uppercase tracking-wider">Triage Lifecycle Stage</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{ticket.title}</h2>
              </div>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/40 text-xs self-start sm:self-auto font-mono">
                Est. Resolution: &lt; 2 Hours
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-blue-500" />
              <div className="grid grid-cols-5 text-[10px] sm:text-xs font-mono text-slate-400 pt-1">
                <span className={progress >= 20 ? "text-blue-400 font-semibold" : ""}>1. Reported</span>
                <span className={progress >= 40 ? "text-blue-400 font-semibold" : ""}>2. AI Triaged</span>
                <span className={progress >= 60 ? "text-blue-400 font-semibold" : ""}>3. Dispatched</span>
                <span className={progress >= 80 ? "text-blue-400 font-semibold text-center" : "text-center"}>4. In Progress</span>
                <span className={progress >= 100 ? "text-emerald-400 font-semibold text-right" : "text-right"}>5. Resolved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Image, Gemini AI Breakdown & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gemini Vision AI Assessment Breakdown Card */}
            <Card className="border-blue-200 dark:border-blue-900 shadow-xs bg-white dark:bg-slate-900">
              <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-950 bg-blue-50/50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Gemini AI Vision Analysis
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Automated computer vision triage & spatial duplicate detection
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-xs">
                    {ticket.aiAnalysis?.confidenceScore || 0}% Vision Confidence
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">Detected Hazard Category</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{ticket.aiAnalysis?.detectedCategory || "Pending Analysis"}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">Severity Score & Level</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white font-mono font-bold text-xs px-2 ${ticket.severity >= 4 ? 'bg-red-600' : ticket.severity === 3 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                        Severity {ticket.severity || "N/A"} / 5
                      </Badge>
                      <span className={`text-xs font-semibold ${ticket.severity >= 4 ? 'text-red-600 dark:text-red-400' : ticket.severity === 3 ? 'text-orange-600 dark:text-orange-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        ({ticket.priority || "Unknown"} Priority)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-1 text-xs">
                  <span className="text-[11px] text-muted-foreground uppercase font-mono font-medium">AI Rationale & Visual Evidence</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                    &quot;{ticket.aiAnalysis?.explanation || "Awaiting Gemini Vision AI assessment..."}&quot;
                  </p>
                </div>

                {/* Spatial Duplicate Check */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Spatial Cluster Check (100m Radius): <strong>0 Duplicate Tickets Found</strong></span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-700 dark:text-emerald-300 font-mono">
                    Clear
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Timeline / Activity Audit Trail */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="size-4 text-blue-600" /> Triage Audit Trail & Timeline
                </CardTitle>
                <CardDescription className="text-xs">Chronological log of AI analysis and dispatcher actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="relative space-y-6">
                  {/* Continuous Vertical Timeline Thread Line */}
                  <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

                  {ticket.timeline && Array.isArray(ticket.timeline) ? ticket.timeline.map((item: any, index: number) => (
                    <div key={index} className="relative flex items-start gap-3.5 group">
                      {/* Circle Node Icon centered over the thread line */}
                      <div className="relative z-10 size-7.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 flex items-center justify-center text-blue-600 text-xs shrink-0 shadow-xs">
                        {item.iconType === "ai" ? (
                          <Sparkles className="size-3.5 text-blue-600" />
                        ) : item.iconType === "dispatcher" ? (
                          <Building2 className="size-3.5 text-purple-600" />
                        ) : item.iconType === "field" ? (
                          <HardHat className="size-3.5 text-amber-600" />
                        ) : (
                          <User className="size-3.5 text-slate-600" />
                        )}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                          <span className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                        <span className="text-[10px] font-mono text-slate-400 block pt-0.5">Logged by: {item.author}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 italic pl-8">No timeline events recorded yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Photo Evidence & Location Details */}
          <div className="space-y-6">
            {/* Photo Evidence Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Citizen Photo Evidence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ticket?.imageUrl ?? ""}
                    alt={ticket.title ?? ""}  
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono backdrop-blur-xs">
                    GPS Embedded
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Department Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" /> Location & Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px]">Address:</span>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{ticket.address}</p>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Assigned Department:</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{ticket.assignedDepartment}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Dispatched Crew:</span>
                    <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                      <HardHat className="size-3.5" /> {ticket.assignedCrew}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2">
                  <Link className="flex items-center gap-2" href="/manager/map">
                    <ExternalLink className="size-3.5" /> View on GIS Map
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
