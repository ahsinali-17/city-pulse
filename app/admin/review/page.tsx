import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { and, asc, desc, eq, lt, notInArray, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminReviewDashboard } from "@/components/admin/review-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [suspendedRows, archivedRows, aiRows, departmentOptions] = await Promise.all([
    db
      .select({
        id: tickets.id,
        title: tickets.title,
        status: tickets.status,
        priority: tickets.priority,
        department: departments.name,
      })
      .from(tickets)
      .leftJoin(departments, eq(tickets.departmentId, departments.id))
      .where(and(eq(departments.status, "SUSPENDED"), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])))
      .orderBy(desc(tickets.createdAt)),
    db
      .select({
        id: tickets.id,
        title: tickets.title,
        status: tickets.status,
        priority: tickets.priority,
        department: departments.name,
      })
      .from(tickets)
      .leftJoin(departments, eq(tickets.departmentId, departments.id))
      .where(and(eq(departments.status, "ARCHIVED"), notInArray(tickets.status, ["RESOLVED", "COMPLETED"])))
      .orderBy(desc(tickets.createdAt)),
    db
      .select({
        id: tickets.id,
        title: tickets.title,
        status: tickets.status,
        priority: tickets.priority,
        department: departments.name,
        imageUrl: tickets.imageUrl,
        aiConfidence: tickets.aiConfidence,
      })
      .from(tickets)
      .leftJoin(departments, eq(tickets.departmentId, departments.id))
      .where(or(eq(tickets.routingReviewStatus, "NEEDS_ADMIN_REVIEW"), lt(tickets.aiConfidence, 0.4)))
      .orderBy(desc(tickets.createdAt)),
    db
      .select({ id: departments.id, name: departments.name })
      .from(departments)
      .where(eq(departments.status, "ACTIVE"))
      .orderBy(asc(departments.name)),
  ]);

  const suspendedTickets = suspendedRows.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    department: ticket.department ?? "Unassigned",
    status: ticket.status,
    priority: ticket.priority ?? "NORMAL",
    eta: "Live review",
  }));

  const archivedTickets = archivedRows.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    department: ticket.department ?? "Unassigned",
    status: ticket.status,
    priority: ticket.priority ?? "NORMAL",
    eta: "Archive review",
  }));

  const aiTickets = aiRows.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    department: ticket.department ?? "Unassigned",
    status: ticket.status,
    priority: ticket.priority ?? "NORMAL",
    eta: "Needs route correction",
    imageUrl: ticket.imageUrl,
    aiConfidence: ticket.aiConfidence,
  }));

  return (
    <AdminReviewDashboard
      suspendedTickets={suspendedTickets}
      archivedTickets={archivedTickets}
      aiTickets={aiTickets}
      departments={departmentOptions}
    />
  );
}
