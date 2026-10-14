"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { ticketEvents } from "@/lib/db/schema/ticket-events";
import { tickets } from "@/lib/db/schema/tickets";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  return session.user.id;
}

async function getOpenTicket(ticketId: string) {
  const [ticket] = await db
    .select({
      id: tickets.id,
      departmentId: tickets.departmentId,
      routingReviewStatus: tickets.routingReviewStatus,
    })
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));

  if (!ticket) {
    throw new Error("This ticket is no longer available for review.");
  }

  return ticket;
}

async function getActiveDepartment(departmentId: string) {
  const [department] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.id, departmentId), eq(departments.status, "ACTIVE")));

  if (!department) {
    throw new Error("Choose an active department.");
  }

  return department;
}

export async function freezeAndNotifyTicket(ticketId: string) {
  await requireAdmin();
  const ticket = await getOpenTicket(ticketId);

  if (!ticket.departmentId) {
    throw new Error("This ticket has no department to freeze.");
  }

  const [department] = await db
    .select({ status: departments.status })
    .from(departments)
    .where(eq(departments.id, ticket.departmentId));

  if (!department || department.status !== "SUSPENDED") {
    throw new Error("Freeze and notify is only available for suspended departments.");
  }

  const now = new Date();
  await db.batch([
    db
      .update(tickets)
      .set({
        routingReviewStatus: "NEEDS_ADMIN_REVIEW",
        routingCorrectionReason: "SUSPENDED_DEPARTMENT",
        routingUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId)),
  ]);

  revalidatePath("/admin/review");
  revalidatePath("/manager/dispatch");
}

export async function assignTicketDepartment(ticketId: string, departmentId: string) {
  const actorId = await requireAdmin();
  const ticket = await getOpenTicket(ticketId);

  if (!departmentId) {
    throw new Error("Choose a department before assigning this ticket.");
  }

  await getActiveDepartment(departmentId);

  if (ticket.departmentId === departmentId) {
    throw new Error("Choose a different department for this route correction.");
  }

  const now = new Date();
  await db.batch([
    db
      .update(tickets)
      .set({
        departmentId,
        routingSource: "REVIEW",
        routingReviewStatus: "RESOLVED",
        routingCorrectionReason: "ADMIN_REVIEW",
        routingUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId)),
    db.insert(ticketEvents).values({
      id: `event-${crypto.randomUUID()}`,
      ticketId,
      eventType: "ROUTING_ASSIGNED",
      actorId,
      fromDepartmentId: ticket.departmentId,
      toDepartmentId: departmentId,
      reason: "ADMIN_REVIEW",
      createdAt: now,
    }),
  ]);

  revalidatePath("/admin/review");
  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}

export async function returnTicketToManager(ticketId: string) {
  const actorId = await requireAdmin();
  const ticket = await getOpenTicket(ticketId);

  if (!ticket.departmentId) {
    throw new Error("This ticket has no department to return to.");
  }

  const now = new Date();
  await db.batch([
    db
      .update(tickets)
      .set({
        routingSource: "ADMIN",
        routingReviewStatus: "RESOLVED",
        routingCorrectionReason: "ADMIN_RETURNED_TO_MANAGER",
        routingUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId)),
    db.insert(ticketEvents).values({
      id: `event-${crypto.randomUUID()}`,
      ticketId,
      eventType: "ROUTING_CORRECTED",
      actorId,
      fromDepartmentId: ticket.departmentId,
      toDepartmentId: ticket.departmentId,
      reason: "ADMIN_RETURNED_TO_MANAGER",
      createdAt: now,
    }),
  ]);

  revalidatePath("/admin/review");
  revalidatePath("/manager/dispatch");
}

export async function bulkAssignTicketDepartments(assignments: Array<{ ticketId: string; departmentId: string }>) {
  const actorId = await requireAdmin();

  if (assignments.length === 0) {
    throw new Error("Select at least one ticket and destination department.");
  }

  const ticketIds = assignments.map((assignment) => assignment.ticketId);
  if (new Set(ticketIds).size !== ticketIds.length) {
    throw new Error("A ticket can only appear once in a bulk reroute.");
  }

  const departmentIds = [...new Set(assignments.map((assignment) => assignment.departmentId))];
  const activeDepartments = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(inArray(departments.id, departmentIds), eq(departments.status, "ACTIVE")));
  const activeDepartmentIds = new Set(activeDepartments.map((department) => department.id));

  if (activeDepartmentIds.size !== departmentIds.length) {
    throw new Error("Every bulk destination must be an active department.");
  }

  const ticketsById = new Map(
    await Promise.all(
      assignments.map(async (assignment) => [assignment.ticketId, await getOpenTicket(assignment.ticketId)] as const),
    ),
  );
  const now = new Date();

  for (const assignment of assignments) {
    const ticket = ticketsById.get(assignment.ticketId);
    if (!ticket || ticket.departmentId === assignment.departmentId) {
      throw new Error(`Ticket ${assignment.ticketId} already belongs to that department or is unavailable.`);
    }
  }

  const operations = assignments.flatMap((assignment) => {
    const ticket = ticketsById.get(assignment.ticketId)!;
    return [
      db
        .update(tickets)
        .set({
          departmentId: assignment.departmentId,
          routingSource: "REVIEW",
          routingReviewStatus: "RESOLVED",
          routingCorrectionReason: "ADMIN_BULK_REVIEW",
          routingUpdatedAt: now,
          updatedAt: now,
        })
        .where(eq(tickets.id, assignment.ticketId)),
      db.insert(ticketEvents).values({
        id: `event-${crypto.randomUUID()}`,
        ticketId: assignment.ticketId,
        eventType: "ROUTING_ASSIGNED",
        actorId,
        fromDepartmentId: ticket.departmentId,
        toDepartmentId: assignment.departmentId,
        reason: "ADMIN_BULK_REVIEW",
        createdAt: now,
      }),
    ];
  });

  await db.batch(operations as [typeof operations[number], ...typeof operations[number][]]);

  revalidatePath("/admin/review");
  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}

export async function correctTicketRoute(ticketId: string, departmentId: string) {
  const actorId = await requireAdmin();
  const ticket = await getOpenTicket(ticketId);

  if (!departmentId) {
    throw new Error("Choose a department before correcting this route.");
  }

  await getActiveDepartment(departmentId);

  if (ticket.departmentId === departmentId) {
    throw new Error("Choose a different department for this route correction.");
  }

  const now = new Date();
  await db.batch([
    db
      .update(tickets)
      .set({
        departmentId,
        routingSource: "ADMIN",
        routingReviewStatus: "RESOLVED",
        routingCorrectionReason: "ADMIN_ROUTE_CORRECTION",
        routingUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(tickets.id, ticketId)),
    db.insert(ticketEvents).values({
      id: `event-${crypto.randomUUID()}`,
      ticketId,
      eventType: "ROUTING_CORRECTED",
      actorId,
      fromDepartmentId: ticket.departmentId,
      toDepartmentId: departmentId,
      reason: "ADMIN_ROUTE_CORRECTION",
      createdAt: now,
    }),
  ]);

  revalidatePath("/admin/review");
  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}
