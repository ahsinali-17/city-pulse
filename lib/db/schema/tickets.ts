import { pgTable, text, timestamp, integer, doublePrecision, json } from "drizzle-orm/pg-core";
import { users } from "./users";
import { departments } from "./departments";

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
  
  // AI & Timeline
  aiAnalysis: json("ai_analysis").$type<any>(),
  timeline: json("timeline").$type<any[]>(),
  
  // Relations
  reporterId: text("reporter_id").references(() => users.id),
  assignedCrewId: text("assigned_crew_id").references(() => users.id),
  departmentId: text("department_id").references(() => departments.id),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
