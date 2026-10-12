import { json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { departments } from "./departments";
import { tickets } from "./tickets";
import { users } from "./users";

export const ticketEventType = pgEnum("ticket_event_type", [
  "ROUTING_ASSIGNED",
  "ROUTING_CORRECTION_REQUESTED",
  "ROUTING_CORRECTED",
  "DEPARTMENT_SUSPENDED",
  "DEPARTMENT_ARCHIVED",
  "WORKER_ASSIGNED",
  "WORKER_REASSIGNED",
  "SEVERITY_OVERRIDDEN",
]);

export const ticketEvents = pgTable("ticket_events", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => tickets.id),
  eventType: ticketEventType("event_type").notNull(),
  actorId: text("actor_id").references(() => users.id),
  fromDepartmentId: text("from_department_id").references(() => departments.id),
  toDepartmentId: text("to_department_id").references(() => departments.id),
  reason: text("reason"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});