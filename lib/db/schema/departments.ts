import { pgTable, text } from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: text("id").primaryKey(), // e.g. 'dept-water'
  name: text("name").notNull(), // 'Water & Utilities'
  description: text("description"),
});
