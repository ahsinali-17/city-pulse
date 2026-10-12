import { relations } from "drizzle-orm";
import { users } from "./users";
import { departments } from "./departments";
import { tickets } from "./tickets";
import { ticketEvents } from "./ticket-events";

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  reportedTickets: many(tickets, { relationName: "reporter" }),
  assignedTickets: many(tickets, { relationName: "assignedCrew" }),
  ticketEvents: many(ticketEvents),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  tickets: many(tickets),
  ticketEventsFrom: many(ticketEvents, { relationName: "fromDepartment" }),
  ticketEventsTo: many(ticketEvents, { relationName: "toDepartment" }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
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
  events: many(ticketEvents),
}));

export const ticketEventsRelations = relations(ticketEvents, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketEvents.ticketId],
    references: [tickets.id],
  }),
  actor: one(users, {
    fields: [ticketEvents.actorId],
    references: [users.id],
  }),
  fromDepartment: one(departments, {
    fields: [ticketEvents.fromDepartmentId],
    references: [departments.id],
    relationName: "fromDepartment",
  }),
  toDepartment: one(departments, {
    fields: [ticketEvents.toDepartmentId],
    references: [departments.id],
    relationName: "toDepartment",
  }),
}));
