import { boolean, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { departments } from "./departments";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using string IDs like 'usr-123'
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] }).notNull().default("CITIZEN"),
  departmentId: text("department_id").references(() => departments.id),
  isActive: boolean("is_active").notNull().default(true),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("users_one_manager_per_department_idx").on(table.departmentId).where(
    // PostgreSQL's partial index applies the uniqueness rule only to managers.
    sql`${table.role} = 'MANAGER' AND ${table.isActive} = true`
  ),
]);
