import { relations } from "drizzle-orm";
import { users } from "./users";
import { departments } from "./departments";
import { tickets } from "./tickets";

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  reportedTickets: many(tickets, { relationName: "reporter" }),
  assignedTickets: many(tickets, { relationName: "assignedCrew" }),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
  tickets: many(tickets),
}));

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
