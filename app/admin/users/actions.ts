"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { getAllowedRoleTransitions, isDepartmentAssignmentAllowed, type UserRole } from "@/lib/admin/role-validation";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/** Guard: only ADMIN can perform these actions */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
  return session;
}

export async function updateUserRole(
  userId: string,
  newRole: "CITIZEN" | "FIELD_WORKER" | "MANAGER" | "ADMIN"
) {
  const session = await requireAdmin();

  if (userId === session.user.id) {
    throw new Error("You cannot change your own role.");
  }

  const [currentUser] = await db
    .select({ role: users.role, departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, userId));

  if (!currentUser) {
    throw new Error("User not found.");
  }

  const allowedRoles = getAllowedRoleTransitions(currentUser.role as UserRole);
  if (!allowedRoles.includes(newRole)) {
    throw new Error("This role transition is not allowed in staff onboarding.");
  }

  if (newRole === "ADMIN") {
    const adminExists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "ADMIN"));

    if (adminExists.length > 0 && adminExists[0].id !== userId) {
      throw new Error("Only one admin can exist across the platform.");
    }
  }

  if (newRole === "MANAGER" && !currentUser.departmentId) {
    throw new Error("Managers must stay assigned to a department.");
  }

  const updates: { role: UserRole; departmentId?: string | null } = { role: newRole };
  if (newRole === "CITIZEN" || newRole === "ADMIN") {
    updates.departmentId = null;
  }

  const oldDepartmentId = currentUser.departmentId;
  await db.update(users).set(updates).where(eq(users.id, userId));

  if (currentUser.role === "MANAGER" && newRole !== "MANAGER" && oldDepartmentId) {
    const remainingManagers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "MANAGER"), eq(users.departmentId, oldDepartmentId), eq(users.isActive, true)));

    if (remainingManagers.length === 0) {
      await db
        .update(departments)
        .set({ status: "SUSPENDED", statusReason: "NO_MANAGER" })
        .where(eq(departments.id, oldDepartmentId));
    }
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/departments");
}

export async function updateUserDepartment(
  userId: string,
  departmentId: string | null
) {
  await requireAdmin();

  const [currentUser] = await db
    .select({ role: users.role, departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, userId));

  if (!currentUser) {
    throw new Error("User not found.");
  }

  if (currentUser.role === "CITIZEN" || currentUser.role === "ADMIN") {
    throw new Error("Citizens and admins are not assigned to departments.");
  }

  if (currentUser.role === "MANAGER" && !departmentId) {
    throw new Error("Managers must remain assigned to a department.");
  }

  if (departmentId && currentUser.role === "MANAGER") {
    const existingManager = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "MANAGER"), eq(users.departmentId, departmentId), eq(users.isActive, true)));

    if (existingManager.length > 0 && existingManager[0].id !== userId) {
      throw new Error("That department already has a manager. Choose a different department.");
    }
  }

  if (!isDepartmentAssignmentAllowed(currentUser.role as UserRole, departmentId)) {
    throw new Error("Department assignment is only valid for field workers and managers.");
  }

  const previousDepartmentId = currentUser.departmentId;
  await db
    .update(users)
    .set({ departmentId })
    .where(eq(users.id, userId));

  if (currentUser.role === "MANAGER" && previousDepartmentId && previousDepartmentId !== departmentId) {
    const previousDepartmentManagers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "MANAGER"), eq(users.departmentId, previousDepartmentId), eq(users.isActive, true)));

    if (previousDepartmentManagers.length === 0) {
      await db
        .update(departments)
        .set({ status: "SUSPENDED", statusReason: "NO_MANAGER" })
        .where(eq(departments.id, previousDepartmentId));
    }
  }

  if (currentUser.role === "MANAGER" && departmentId) {
    await db
      .update(departments)
      .set({ status: "ACTIVE", statusReason: null })
      .where(eq(departments.id, departmentId));
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/departments");
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();

  // Prevent admins from deleting themselves
  if (userId === session.user.id) {
    throw new Error("You cannot delete your own account.");
  }

  // Preserve ticket history while clearing the user's foreign-key references.
  await db
    .update(tickets)
    .set({ reporterId: null })
    .where(eq(tickets.reporterId, userId));

  await db
    .update(tickets)
    .set({ assignedCrewId: null })
    .where(eq(tickets.assignedCrewId, userId));

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function createDepartment(name: string, description: string) {
  await requireAdmin();

  if (!name || name.trim().length < 2) {
    throw new Error("Department name must be at least 2 characters.");
  }

  const deptId = `dept-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}`;

  // Check for duplicate ID
  const existing = await db
    .select({ id: departments.id })
    .from(departments)
    .where(eq(departments.id, deptId));

  if (existing.length > 0) {
    throw new Error("A department with a similar name already exists.");
  }

  await db.insert(departments).values({
    id: deptId,
    name: name.trim(),
    description: description.trim() || null,
  });

  revalidatePath("/admin/users");
}

export async function deleteDepartment(departmentId: string) {
  await requireAdmin();

  // Clear every foreign-key reference before deleting the department.
  await db
    .update(users)
    .set({ departmentId: null })
    .where(eq(users.departmentId, departmentId));

  await db
    .update(tickets)
    .set({ departmentId: null })
    .where(eq(tickets.departmentId, departmentId));

  await db.delete(departments).where(eq(departments.id, departmentId));
  revalidatePath("/admin/users");
}

