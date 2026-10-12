import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { departments } from "@/lib/db/schema/departments";
import { desc, eq } from "drizzle-orm";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const allTickets = await db
    .select({ ticket: tickets, department: departments })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .orderBy(desc(tickets.createdAt));

  // Serialize for the client component
  const serializedTickets = allTickets.map(({ ticket, department }) => ({
    id: ticket.id,
    title: ticket.title,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority ?? "NORMAL",
    severity: ticket.severity ?? 0,
    address: ticket.address,
    departmentId: ticket.departmentId,
    departmentName: department?.name ?? "Unassigned",
    createdAt: ticket.createdAt.toISOString(),
  }));

  return <AdminDashboardClient allTickets={serializedTickets} />;
}
