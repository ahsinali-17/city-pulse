import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { eq, count, and, inArray, notInArray } from "drizzle-orm";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  User,
  HardHat,
  MapPin,
  Calendar,
  Building2,
  Ticket,
  CheckCircle2,
  Activity,
  Clock,
  Users,
  Wrench,
} from "lucide-react";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Operator Profile & Settings | CityPulse Triage",
  description: "Manage your civic profile, credentials, and municipal platform settings.",
};

const roleBadges: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  CITIZEN: {
    label: "Citizen (Public)",
    icon: User,
    color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700/60",
  },
  FIELD_WORKER: {
    label: "Field Crew (PWA)",
    icon: HardHat,
    color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60",
  },
  MANAGER: {
    label: "Dispatcher (GIS)",
    icon: MapPin,
    color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60",
  },
  ADMIN: {
    label: "City Admin",
    icon: Shield,
    color: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700/60",
  },
};

function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}

async function ProfileContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  // 1. Fetch user from database
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  const currentUser = userResult[0];
  if (!currentUser) {
    redirect("/login");
  }

  // 2. Fetch department details if assigned
  let departmentDetails = null;
  if (currentUser.departmentId) {
    const deptResult = await db
      .select()
      .from(departments)
      .where(eq(departments.id, currentUser.departmentId));
    departmentDetails = deptResult[0] || null;
  }

  // 3. Query role-specific contextual statistics based on schema
  interface RoleKpi {

    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ElementType;
    color: string;
  }

  let kpiCards: RoleKpi[] = [];

  try {
    if (currentUser.role === "ADMIN") {
      const [totalTickets, pendingTickets, activeDepts, totalStaff] = await Promise.all([
        db.select({ value: count() }).from(tickets),
        db
          .select({ value: count() })
          .from(tickets)
          .where(notInArray(tickets.status, ["RESOLVED", "COMPLETED"])),
        db
          .select({ value: count() })
          .from(departments)
          .where(eq(departments.status, "ACTIVE")),
        db
          .select({ value: count() })
          .from(users)
          .where(inArray(users.role, ["FIELD_WORKER", "MANAGER"])),
      ]);

      kpiCards = [
        {
          title: "Citywide Incidents",
          value: totalTickets[0]?.value ?? 0,
          subtitle: "Total logged across city",
          icon: Ticket,
          color: "text-blue-500",
        },
        {
          title: "Active Triage Backlog",
          value: pendingTickets[0]?.value ?? 0,
          subtitle: "Pending dispatch/resolution",
          icon: Clock,
          color: "text-amber-500",
        },
        {
          title: "Active Departments",
          value: activeDepts[0]?.value ?? 0,
          subtitle: "Operational municipal units",
          icon: Building2,
          color: "text-purple-500",
        },
        {
          title: "Deployed Staff",
          value: totalStaff[0]?.value ?? 0,
          subtitle: "Field crews & dispatchers",
          icon: Users,
          color: "text-emerald-500",
        },
      ];
    } else if (currentUser.role === "MANAGER") {
      const deptId = currentUser.departmentId || "";
      const [deptTotal, deptPending, deptInField, deptCrew] = await Promise.all([
        db
          .select({ value: count() })
          .from(tickets)
          .where(eq(tickets.departmentId, deptId)),
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.departmentId, deptId),
              inArray(tickets.status, ["REPORTED", "TRIAGED"])
            )
          ),
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.departmentId, deptId),
              inArray(tickets.status, [
                "ASSIGNED",
                "DISPATCHED",
                "EN_ROUTE",
                "ON_SITE",
                "IN_PROGRESS",
              ])
            )
          ),
        db
          .select({ value: count() })
          .from(users)
          .where(
            and(eq(users.departmentId, deptId), eq(users.role, "FIELD_WORKER"))
          ),
      ]);

      kpiCards = [
        {
          title: "Department Tickets",
          value: deptTotal[0]?.value ?? 0,
          subtitle: "Total assigned to department",
          icon: Ticket,
          color: "text-blue-500",
        },
        {
          title: "Awaiting Dispatch",
          value: deptPending[0]?.value ?? 0,
          subtitle: "Pending crew assignment",
          icon: Clock,
          color: "text-amber-500",
        },
        {
          title: "In-Field Operations",
          value: deptInField[0]?.value ?? 0,
          subtitle: "Active on-site work orders",
          icon: Activity,
          color: "text-indigo-500",
        },
        {
          title: "Field Crews Active",
          value: deptCrew[0]?.value ?? 0,
          subtitle: "Assigned department personnel",
          icon: Users,
          color: "text-emerald-500",
        },
      ];
    } else if (currentUser.role === "FIELD_WORKER") {
      const [activeOrders, completedOrders] = await Promise.all([
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.assignedCrewId, currentUser.id),
              notInArray(tickets.status, ["RESOLVED", "COMPLETED"])
            )
          ),
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.assignedCrewId, currentUser.id),
              inArray(tickets.status, ["RESOLVED", "COMPLETED"])
            )
          ),
      ]);

      kpiCards = [
        {
          title: "Assigned Work Orders",
          value: activeOrders[0]?.value ?? 0,
          subtitle: "Pending field repair",
          icon: Wrench,
          color: "text-amber-500",
        },
        {
          title: "Repairs Completed",
          value: completedOrders[0]?.value ?? 0,
          subtitle: "Resolved & documented",
          icon: CheckCircle2,
          color: "text-emerald-500",
        },
        {
          title: "Assigned Department",
          value: departmentDetails?.name || "Maintenance",
          subtitle: "Operational division",
          icon: Building2,
          color: "text-blue-500",
        },
        {
          title: "Task Queue Status",
          value: "Active & Ready",
          subtitle: "PWA offline sync enabled",
          icon: Activity,
          color: "text-emerald-500",
        },
      ];
    } else {
      // CITIZEN
      const [citizenReports, citizenResolved, citizenPending] = await Promise.all([
        db
          .select({ value: count() })
          .from(tickets)
          .where(eq(tickets.reporterId, currentUser.id)),
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.reporterId, currentUser.id),
              inArray(tickets.status, ["RESOLVED", "COMPLETED"])
            )
          ),
        db
          .select({ value: count() })
          .from(tickets)
          .where(
            and(
              eq(tickets.reporterId, currentUser.id),
              notInArray(tickets.status, ["RESOLVED", "COMPLETED"])
            )
          ),
      ]);

      kpiCards = [
        {
          title: "My Hazard Reports",
          value: citizenReports[0]?.value ?? 0,
          subtitle: "Issues submitted by you",
          icon: Ticket,
          color: "text-blue-500",
        },
        {
          title: "Resolved by City",
          value: citizenResolved[0]?.value ?? 0,
          subtitle: "Fixed by municipal crews",
          icon: CheckCircle2,
          color: "text-emerald-500",
        },
        {
          title: "Under Active Triage",
          value: citizenPending[0]?.value ?? 0,
          subtitle: "In inspection or dispatch",
          icon: Clock,
          color: "text-amber-500",
        },
        {
          title: "Civic Standing",
          value: "Verified Citizen",
          subtitle: "Community reporter tier",
          icon: User,
          color: "text-emerald-500",
        },
      ];
    }
  } catch (err) {
    console.error("Error fetching profile metrics:", err);
  }

  const roleMeta = roleBadges[currentUser.role] || roleBadges.CITIZEN;
  const RoleIcon = roleMeta.icon;

  const initials = currentUser.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "CP";

  const memberSince = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Active Member";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Civic Profile Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="size-20 md:size-24 border-2 border-blue-500/40 shadow-xl ring-4 ring-blue-500/10">
              <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
              <AvatarFallback className="bg-blue-600 text-white font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 border ${roleMeta.color}`}
                >
                  <RoleIcon className="size-3 mr-1 inline-block" />
                  {roleMeta.label}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 font-mono">{currentUser.email}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  Joined {memberSince}
                </span>

                {currentUser.role === "ADMIN" && (
                  <span className="flex items-center gap-1.5 text-purple-300">
                    <Shield className="size-3.5" />
                    City Executive Administration
                  </span>
                )}

                {currentUser.role === "CITIZEN" && (
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <User className="size-3.5" />
                    Resident Portal
                  </span>
                )}

                {(currentUser.role === "FIELD_WORKER" || currentUser.role === "MANAGER") && departmentDetails && (
                  <span className="flex items-center gap-1.5 text-blue-300">
                    <Building2 className="size-3.5" />
                    {departmentDetails.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">
                {currentUser.isActive ? "Active Account" : "Suspended"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              ID: {currentUser.id}
            </span>
          </div>
        </div>

        {/* Ambient subtle backdrop decorative glow */}
        <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Role-Contextual KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-medium">{kpi.title}</span>
                <Icon className={`size-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                {kpi.value}
              </div>
              <span className="text-[11px] text-muted-foreground block truncate">
                {kpi.subtitle}
              </span>
            </div>
          );
        })}
      </div>


      {/* Interactive Tabs for Profile Updates and Settings */}
      <ProfileTabs
        initialUser={{
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          departmentId: currentUser.departmentId,
          departmentName: departmentDetails?.name,
          departmentStatus: departmentDetails?.status,
          departmentStatusReason: departmentDetails?.statusReason,
          isActive: currentUser.isActive,
          avatarUrl: currentUser.avatarUrl,
          createdAt: currentUser.createdAt.toISOString(),
        }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
