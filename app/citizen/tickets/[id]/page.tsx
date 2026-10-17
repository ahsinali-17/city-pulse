import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { TicketDetailActions } from "@/components/citizen/ticket-detail-actions";
import { TicketProgressBanner } from "@/components/citizen/ticket-detail/ticket-progress-banner";
import { TicketAiAnalysisCard } from "@/components/citizen/ticket-detail/ticket-ai-analysis-card";
import { TicketTimelineCard } from "@/components/citizen/ticket-detail/ticket-timeline-card";
import { TicketLocationCard } from "@/components/citizen/ticket-detail/ticket-location-card";
import {
  Ticket,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

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
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const ticketId = resolvedParams.id;
  
  const [ticket] = await db
    .select({
      id: tickets.id,
      userId: tickets.reporterId,
      reporterId: tickets.reporterId,
      title: tickets.title,
      category: tickets.category,
      description: tickets.description,
      status: tickets.status,
      createdAt: tickets.createdAt,
      imageUrl: tickets.imageUrl,
      address: tickets.address,
      lat: tickets.lat,
      lng: tickets.lng,
      severity: tickets.severity,
      priority: tickets.priority,
      aiAnalysis: tickets.aiAnalysis,
      timeline: tickets.timeline,
      assignedDepartment: departments.name,
      departmentStatus: departments.status,
      assignedCrew: users.name,
    })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .leftJoin(users, eq(tickets.assignedCrewId, users.id))
    .where(eq(tickets.id, ticketId));

  if (!ticket || ticket.userId !== session.user.id) {
    redirect("/citizen/tickets?error=unauthorized");
  }

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

          <TicketDetailActions ticket={ticket} />
        </div>

        {ticket.departmentStatus === "SUSPENDED" && (ticket.status === "REPORTED" || ticket.status === "TRIAGED") && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-50">
            <AlertTriangle className="size-4 text-amber-700 dark:text-amber-300" />
            <AlertDescription className="text-sm font-medium text-amber-900 dark:text-amber-100">
              {ticket.assignedDepartment || "This department"} is currently undergoing service updates. Your ticket has been noted and will be attended to as soon as operations resume.
            </AlertDescription>
          </Alert>
        )}

        {/* Status Progress Tracker Banner */}
        <TicketProgressBanner title={ticket.title} status={ticket.status} />

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI Breakdown & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <TicketAiAnalysisCard
              aiAnalysis={ticket.aiAnalysis}
              severity={ticket.severity}
              priority={ticket.priority}
            />
            <TicketTimelineCard timeline={ticket.timeline} />
          </div>

          {/* Right Column: Photo Evidence & Location Details */}
          <TicketLocationCard ticket={ticket} />
        </div>
      </div>
    </Suspense>
  );
}
