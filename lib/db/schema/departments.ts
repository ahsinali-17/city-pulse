import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const departmentStatus = pgEnum("department_status", [
  "SUSPENDED",
  "ACTIVE",
  "ARCHIVED",
]);

export const departmentStatusReason = pgEnum("department_status_reason", [
  "NO_MANAGER",
  "MANAGER_DEACTIVATED",
  "ADMIN_DISABLED",
  "ARCHIVED",
]);

export const departments = pgTable("departments", {
  id: text("id").primaryKey(), // e.g. 'dept-water'
  name: text("name").notNull(), // 'Water & Utilities'
  description: text("description"),
  status: departmentStatus("status").notNull().default("SUSPENDED"),
  statusReason: departmentStatusReason("status_reason").default("NO_MANAGER"),
  managerAssignedAt: timestamp("manager_assigned_at"),
});
