import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ticketEvents } from "@/lib/db/schema/ticket-events";
import { tickets } from "@/lib/db/schema/tickets";
import { departments } from "@/lib/db/schema/departments";
import { users } from "@/lib/db/schema/users";
import { and, desc, eq, inArray, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface NotificationItem {
  id: string;
  ticketId: string;
  ticketTitle: string;
  eventType: string;
  title: string;
  description: string;
  createdAt: string;
  href: string;
  severity: number;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [] }, { status: 401 });
  }

  const role = session.user.role || "CITIZEN";
  const userId = session.user.id;

  // Fetch user's department if manager/worker
  const [dbUser] = await db
    .select({ departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, userId));
  const userDeptId = dbUser?.departmentId;

  // Build query joining ticket_events -> tickets -> departments
  const baseQuery = db
    .select({
      id: ticketEvents.id,
      ticketId: ticketEvents.ticketId,
      eventType: ticketEvents.eventType,
      reason: ticketEvents.reason,
      createdAt: ticketEvents.createdAt,
      ticketTitle: tickets.title,
      ticketReporterId: tickets.reporterId,
      ticketAssignedCrewId: tickets.assignedCrewId,
      ticketDepartmentId: tickets.departmentId,
      ticketSeverity: tickets.severity,
      fromDeptId: ticketEvents.fromDepartmentId,
      toDeptId: ticketEvents.toDepartmentId,
    })
    .from(ticketEvents)
    .innerJoin(tickets, eq(ticketEvents.ticketId, tickets.id))
    .orderBy(desc(ticketEvents.createdAt))
    .limit(20);

  let events: any[] = [];

  if (role === "ADMIN") {
    // Admin sees all system and operational events
    events = await baseQuery;
  } else if (role === "MANAGER") {
    // Manager sees events related to their department or tickets currently assigned to their department
    if (userDeptId) {
      events = await baseQuery.where(
        or(
          eq(tickets.departmentId, userDeptId),
          eq(ticketEvents.toDepartmentId, userDeptId),
          eq(ticketEvents.fromDepartmentId, userDeptId)
        )
      );
    }
  } else if (role === "FIELD_WORKER") {
    // Field worker sees events related to tickets assigned to them
    events = await baseQuery.where(eq(tickets.assignedCrewId, userId));
  } else {
    // Citizen sees events on tickets they reported
    events = await baseQuery.where(eq(tickets.reporterId, userId));
  }

  // Format notifications with human-readable text and target destination
  const notifications: NotificationItem[] = events.map((ev) => {
    let title = "Ticket Update";
    let description = `Event on #${ev.ticketId}`;
    let href = role === "CITIZEN" ? `/citizen/tickets/${ev.ticketId}` : `/citizen/tickets/${ev.ticketId}`;

    if (role === "ADMIN") {
      href = ev.eventType.includes("CORRECTION") || ev.eventType.includes("SUSPENDED") 
        ? "/admin/review" 
        : `/citizen/tickets/${ev.ticketId}`;
    } else if (role === "MANAGER") {
      href = "/manager/dispatch";
    } else if (role === "FIELD_WORKER") {
      href = "/field";
    }

    switch (ev.eventType) {
      case "ROUTING_ASSIGNED":
        title = "Ticket Dispatched / Routed";
        description = `Assigned to department: "${ev.ticketTitle}"`;
        break;
      case "ROUTING_CORRECTION_REQUESTED":
        title = "Routing Review Requested";
        description = `Manager escalated routing for: "${ev.ticketTitle}"`;
        break;
      case "ROUTING_CORRECTED":
        title = "Routing Corrected";
        description = `Department corrected for: "${ev.ticketTitle}"`;
        break;
      case "WORKER_ASSIGNED":
        title = "Field Crew Assigned";
        description = `Crew dispatched to work on: "${ev.ticketTitle}"`;
        break;
      case "WORKER_REASSIGNED":
        title = "Field Crew Reassigned";
        description = `New crew assigned to: "${ev.ticketTitle}"`;
        break;
      case "DEPARTMENT_SUSPENDED":
        title = "Department Suspended";
        description = `Service suspended; open tickets pending review.`;
        break;
      case "DEPARTMENT_ARCHIVED":
        title = "Department Archived";
        description = `Department retired; assignments returned to triage.`;
        break;
      case "SEVERITY_OVERRIDDEN":
        title = "Severity Overridden";
        description = `Severity updated for: "${ev.ticketTitle}"`;
        break;
      default:
        title = ev.eventType.replace(/_/g, " ");
        description = ev.reason || `Status updated for #${ev.ticketId}`;
    }

    return {
      id: ev.id,
      ticketId: ev.ticketId,
      ticketTitle: ev.ticketTitle,
      eventType: ev.eventType,
      title,
      description,
      createdAt: ev.createdAt.toISOString(),
      href,
      severity: ev.ticketSeverity,
    };
  });

  return NextResponse.json({ notifications });
}
