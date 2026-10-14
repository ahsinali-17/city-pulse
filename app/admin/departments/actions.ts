"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { ticketEvents } from "@/lib/db/schema/ticket-events";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }

  return session;
}

export async function createDepartment(name: string, description: string) {
  await requireAdmin();

  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    throw new Error("Department name must be at least 2 characters.");
  }

  const id = `dept-${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const existing = await db.select({ id: departments.id }).from(departments).where(eq(departments.id, id));
  if (existing.length > 0) {
    throw new Error("A department with a similar name already exists.");
  }

  await db.insert(departments).values({
    id,
    name: trimmedName,
    description: description.trim() || null,
    status: "SUSPENDED",
    statusReason: "NO_MANAGER",
  });

  revalidatePath("/admin/departments");
}

export async function suspendDepartment(departmentId: string) {
  const session = await requireAdmin();
  const [department] = await db
    .select({ status: departments.status })
    .from(departments)
    .where(eq(departments.id, departmentId));

  if (!department) {
    throw new Error("Department not found.");
  }

  if (department.status === "SUSPENDED") {
    throw new Error("This department is already suspended.");
  }

  const openTickets = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.departmentId, departmentId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));
  const now = new Date();

  await db.batch([
    db
      .update(departments)
      .set({ status: "SUSPENDED", statusReason: "ADMIN_DISABLED" })
      .where(eq(departments.id, departmentId)),
    ...openTickets.map((ticket) =>
      db.insert(ticketEvents).values({
        id: `event-${crypto.randomUUID()}`,
        ticketId: ticket.id,
        eventType: "DEPARTMENT_SUSPENDED",
        actorId: session.user.id,
        fromDepartmentId: departmentId,
        reason: "ADMIN_DISABLED",
        createdAt: now,
      }),
    ),
  ]);

  revalidatePath("/admin/departments");
  revalidatePath("/manager/dispatch");
}

export async function unsuspendDepartment(departmentId: string) {
  await requireAdmin();

  const [department] = await db
    .select({ status: departments.status, statusReason: departments.statusReason })
    .from(departments)
    .where(eq(departments.id, departmentId));

  if (!department) {
    throw new Error("Department not found.");
  }

  if (department.status !== "SUSPENDED") {
    throw new Error("Only suspended departments can be unsuspended.");
  }

  if (department.statusReason === "NO_MANAGER" || department.statusReason === "MANAGER_DEACTIVATED") {
    throw new Error("This department is suspended because no manager is assigned. Appoint a manager before unsuspending it.");
  }

  await db
    .update(departments)
    .set({ status: "ACTIVE", statusReason: null })
    .where(eq(departments.id, departmentId));

  revalidatePath("/admin/departments");
  revalidatePath("/manager/dispatch");
}

export async function archiveDepartment(departmentId: string) {
  const session = await requireAdmin();
  const [department] = await db
    .select({ id: departments.id, status: departments.status })
    .from(departments)
    .where(eq(departments.id, departmentId));

  if (!department) {
    throw new Error("Department not found.");
  }

  if (department.status === "ARCHIVED") {
    throw new Error("This department is already archived.");
  }

  const openTickets = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.departmentId, departmentId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])));
  const now = new Date();

  await db.batch([
    db.update(departments).set({ status: "ARCHIVED", statusReason: "ARCHIVED", managerAssignedAt: null }).where(eq(departments.id, departmentId)),
    db
      .update(users)
      .set({ role: "CITIZEN", departmentId: null })
      .where(and(inArray(users.role, ["MANAGER", "FIELD_WORKER"]), eq(users.departmentId, departmentId))),
    db
      .update(tickets)
      .set({ assignedCrewId: null, status: "TRIAGED", routingReviewStatus: "NEEDS_ADMIN_REVIEW", routingCorrectionReason: "ARCHIVED_DEPARTMENT", routingUpdatedAt: now, updatedAt: now })
      .where(and(eq(tickets.departmentId, departmentId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"]))),
    ...openTickets.map((ticket) =>
      db.insert(ticketEvents).values({
        id: `event-${crypto.randomUUID()}`,
        ticketId: ticket.id,
        eventType: "DEPARTMENT_ARCHIVED",
        actorId: session.user.id,
        fromDepartmentId: departmentId,
        reason: "ARCHIVED_DEPARTMENT",
        createdAt: now,
      }),
    ),
  ]);

  revalidatePath("/admin/departments");
  revalidatePath("/manager/dispatch");
  revalidatePath("/admin");
}

export async function reactivateDepartment(departmentId: string) {
  await requireAdmin();

  const [department] = await db
    .select({ status: departments.status })
    .from(departments)
    .where(eq(departments.id, departmentId));

  if (!department) {
    throw new Error("Department not found.");
  }

  if (department.status !== "ARCHIVED") {
    throw new Error("Only archived departments can be reactivated.");
  }

  await db
    .update(departments)
    .set({ status: "SUSPENDED", statusReason: "NO_MANAGER", managerAssignedAt: null })
    .where(eq(departments.id, departmentId));

  revalidatePath("/admin/departments");
  revalidatePath("/admin/users");
  revalidatePath("/manager/dispatch");
}