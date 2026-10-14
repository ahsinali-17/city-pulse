"use server";

import { auth } from "@/auth";
import { departments } from "@/lib/db/schema/departments";
import { ticketEvents } from "@/lib/db/schema/ticket-events";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireDispatcher() {
  const session = await auth();
  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized: manager access required.");
  }

  const [currentUser] = await db
    .select({ id: users.id, role: users.role, departmentId: users.departmentId, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || !currentUser.isActive || currentUser.role !== session.user.role) {
    throw new Error("Your account is no longer authorized for dispatch.");
  }

  if (currentUser.role === "MANAGER" && !currentUser.departmentId) {
    throw new Error("Your manager account is not assigned to an active department.");
  }

  return currentUser;
}

export async function assignTicket(ticketId: string, workerId: string | null) {
  const dispatcher = await requireDispatcher();

  const [ticket] = await db
    .select({ departmentId: tickets.departmentId })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));

  if (!ticket) {
    throw new Error("This ticket is no longer available for dispatch.");
  }

  if (dispatcher.role === "MANAGER" && ticket.departmentId !== dispatcher.departmentId) {
    throw new Error("You can only dispatch tickets from your department.");
  }

  if (workerId) {
    if (!ticket.departmentId) {
      throw new Error("Tickets without a department cannot be assigned.");
    }

    const [department] = await db
      .select({ status: departments.status })
      .from(departments)
      .where(eq(departments.id, ticket.departmentId));

    if (dispatcher.role === "MANAGER" && (!department || department.status !== "ACTIVE")) {
      throw new Error("New assignments are unavailable while this department is suspended or archived.");
    }

    const worker = await db
      .select({ id: users.id, departmentId: users.departmentId, isActive: users.isActive })
      .from(users)
      .where(and(eq(users.id, workerId), eq(users.role, "FIELD_WORKER"), eq(users.isActive, true)));

    if (worker.length === 0 || (ticket.departmentId && worker[0].departmentId !== ticket.departmentId)) {
      throw new Error("Choose an active field worker from this ticket's department.");
    }
  }

  await db
    .update(tickets)
    .set({
      assignedCrewId: workerId,
      status: workerId ? "DISPATCHED" : "TRIAGED",
      ...(dispatcher.role === "ADMIN" && workerId
        ? { routingReviewStatus: "RESOLVED" as const, routingCorrectionReason: "ADMIN_DISPATCH" }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/field");
  revalidatePath("/admin/review");
}

export async function overrideTicketSeverity(ticketId: string, severity: number) {
  const dispatcher = await requireDispatcher();

  if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
    throw new Error("Severity must be an integer from 1 to 5.");
  }

  const [ticket] = await db
    .select({ departmentId: tickets.departmentId })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));

  if (!ticket) {
    throw new Error("This ticket is no longer available for updates.");
  }

  if (dispatcher.role === "MANAGER") {
    if (ticket.departmentId !== dispatcher.departmentId) {
      throw new Error("You can only update active tickets from your department.");
    }

    if (!ticket.departmentId) {
      throw new Error("Severity updates require a valid department assignment.");
    }

    const [department] = await db
      .select({ status: departments.status })
      .from(departments)
      .where(eq(departments.id, ticket.departmentId));

    if (!department || department.status !== "ACTIVE") {
      throw new Error("Severity updates are unavailable while this department is suspended or archived.");
    }
  }

  await db
    .update(tickets)
    .set({ severity, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}

export async function requestTicketAdminReview(ticketId: string) {
  const dispatcher = await requireDispatcher();

  if (dispatcher.role !== "MANAGER" || !dispatcher.departmentId) {
    throw new Error("Only the assigned department manager can request admin review.");
  }

  const [ticket] = await db
    .select({
      departmentId: tickets.departmentId,
      assignedCrewId: tickets.assignedCrewId,
      status: tickets.status,
      departmentStatus: departments.status,
      routingReviewStatus: tickets.routingReviewStatus,
    })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .where(and(eq(tickets.id, ticketId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));

  if (!ticket || ticket.departmentId !== dispatcher.departmentId) {
    throw new Error("You can only escalate tickets from your department.");
  }

  if (ticket.departmentStatus !== "ACTIVE" || ticket.assignedCrewId || !["REPORTED", "TRIAGED"].includes(ticket.status)) {
    throw new Error("Only unassigned new tickets from an active department can be sent for admin review.");
  }

  if (ticket.routingReviewStatus === "NEEDS_ADMIN_REVIEW") {
    throw new Error("This ticket is already waiting for admin review.");
  }

  const now = new Date();
  await db.batch([
    db
      .update(tickets)
      .set({
        routingReviewStatus: "NEEDS_ADMIN_REVIEW",
        routingCorrectionReason: "MANAGER_ESCALATION",
        routingUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId)),
    db.insert(ticketEvents).values({
      id: `event-${crypto.randomUUID()}`,
      ticketId,
      eventType: "ROUTING_CORRECTION_REQUESTED",
      actorId: dispatcher.id,
      fromDepartmentId: dispatcher.departmentId,
      reason: "MANAGER_ESCALATION",
      createdAt: now,
    }),
  ]);

  revalidatePath("/manager/dispatch");
  revalidatePath("/admin/review");
}