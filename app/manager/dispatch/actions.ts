"use server";

import { auth } from "@/auth";
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
    .select({ role: users.role, departmentId: users.departmentId, isActive: users.isActive })
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
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/field");
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

  if (!ticket || (dispatcher.role === "MANAGER" && ticket.departmentId !== dispatcher.departmentId)) {
    throw new Error("You can only update active tickets from your department.");
  }

  await db
    .update(tickets)
    .set({ severity, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}