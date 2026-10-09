"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { eq } from "drizzle-orm";
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

  // Prevent admins from demoting themselves
  if (userId === session.user.id) {
    throw new Error("You cannot change your own role.");
  }

  await db.update(users).set({ role: newRole }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}

export async function updateUserDepartment(
  userId: string,
  departmentId: string | null
) {
  await requireAdmin();
  await db
    .update(users)
    .set({ departmentId })
    .where(eq(users.id, userId));
  revalidatePath("/admin/users");
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

