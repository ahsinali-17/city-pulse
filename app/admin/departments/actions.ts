"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { and, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
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

export async function appointDepartmentManager(departmentId: string, userId: string) {
  await requireAdmin();

  const department = await db
    .select({ status: departments.status })
    .from(departments)
    .where(eq(departments.id, departmentId));
  if (!department[0]) throw new Error("Department not found.");
  if (department[0].status === "ARCHIVED") throw new Error("Archived departments cannot receive a manager.");

  const candidate = await db
    .select({ role: users.role, departmentId: users.departmentId, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, userId));
  const user = candidate[0];
  if (!user || user.role !== "FIELD_WORKER" || !user.isActive || user.departmentId !== departmentId) {
    throw new Error("Only active field workers from this department can become its manager.");
  }

  const existingManager = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "MANAGER"), eq(users.departmentId, departmentId), eq(users.isActive, true)));
  if (existingManager.length > 0) {
    throw new Error("This department already has an active manager.");
  }

  await db.batch([
    db.update(users).set({ role: "MANAGER" }).where(eq(users.id, userId)),
    db.update(departments).set({ status: "ACTIVE", statusReason: null, managerAssignedAt: new Date() }).where(eq(departments.id, departmentId)),
  ]);

  revalidatePath("/admin/departments");
  revalidatePath("/admin/users");
}

export async function suspendDepartment(departmentId: string) {
  await requireAdmin();

  await db
    .update(departments)
    .set({ status: "SUSPENDED", statusReason: "ADMIN_DISABLED" })
    .where(eq(departments.id, departmentId));

  revalidatePath("/admin/departments");
  revalidatePath("/manager/dispatch");
}

export async function archiveDepartment(departmentId: string) {
  await requireAdmin();

  await db.batch([
    db.update(departments).set({ status: "ARCHIVED", statusReason: "ARCHIVED" }).where(eq(departments.id, departmentId)),
    db
      .update(tickets)
      .set({ routingReviewStatus: "NEEDS_ADMIN_REVIEW", routingCorrectionReason: "ARCHIVED_DEPARTMENT", routingUpdatedAt: new Date() })
      .where(and(eq(tickets.departmentId, departmentId), notInArray(tickets.status, ["RESOLVED", "COMPLETED"]))),
  ]);

  revalidatePath("/admin/departments");
  revalidatePath("/manager/dispatch");
  revalidatePath("/admin");
}