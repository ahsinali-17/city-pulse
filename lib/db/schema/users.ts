import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using string IDs like 'usr-123'
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"), // Nullable — seeded users have no password
  role: text("role", { enum: ["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] }).notNull().default("CITIZEN"),
  departmentId: text("department_id"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
