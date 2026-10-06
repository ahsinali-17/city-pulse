import { pgTable, text, timestamp, integer, doublePrecision, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// Users Table
// ----------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Using string IDs like 'usr-123'
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  role: text("role", { enum: ["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] }).notNull().default("CITIZEN"),
  departmentId: text("department_id"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  reportedTickets: many(tickets, { relationName: "reporter" }),
  assignedTickets: many(tickets, { relationName: "assignedCrew" }),
}));

// ----------------------------------------------------------------------
// Departments Table
// ----------------------------------------------------------------------
export const departments = pgTable("departments", {
  id: text("id").primaryKey(), // e.g. 'dept-water'
  name: text("name").notNull(), // 'Water & Utilities'
  description: text("description"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  tickets: many(tickets),
}));

// ----------------------------------------------------------------------
// Tickets Table (Incidents/Hazards)
// ----------------------------------------------------------------------
export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(), // e.g. 'HAZ-8902'
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  severity: integer("severity").notNull(), // 1-5
  status: text("status", { enum: ["REPORTED", "TRIAGED", "ASSIGNED", "DISPATCHED", "EN_ROUTE", "ON_SITE", "IN_PROGRESS", "RESOLVED", "COMPLETED"] }).notNull().default("REPORTED"),
  
  // Geospatial Data
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  address: text("address").notNull(),
  
  // Metadata & Media
  imageUrl: text("image_url"),
  notes: text("notes"),
  priority: text("priority", { enum: ["URGENT", "HIGH", "NORMAL", "LOW"] }).default("NORMAL"),
  
  // Arrays for JSON (Parts)
  partsNeeded: json("parts_needed").$type<string[]>().default([]),
  partsUsed: json("parts_used").$type<string[]>().default([]),
  
  // Relations
  reporterId: text("reporter_id").references(() => users.id),
  assignedCrewId: text("assigned_crew_id").references(() => users.id),
  departmentId: text("department_id").references(() => departments.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketsRelations = relations(tickets, ({ one }) => ({
  reporter: one(users, {
    fields: [tickets.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  assignedCrew: one(users, {
    fields: [tickets.assignedCrewId],
    references: [users.id],
    relationName: "assignedCrew",
  }),
  department: one(departments, {
    fields: [tickets.departmentId],
    references: [departments.id],
  }),
}));
