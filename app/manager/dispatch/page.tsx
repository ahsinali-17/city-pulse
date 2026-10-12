import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { desc, eq, notInArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DispatchBoard } from "@/components/manager/dispatch-board";

export const dynamic = "force-dynamic";

async function DispatchData() {
  const session = await auth();
  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const [ticketRows, workers, departmentRows] = await Promise.all([
    db
      .select({ ticket: tickets, department: departments, crew: users })
      .from(tickets)
      .leftJoin(departments, eq(tickets.departmentId, departments.id))
      .leftJoin(users, eq(tickets.assignedCrewId, users.id))
      .where(
        notInArray(tickets.status, ["RESOLVED", "COMPLETED"])
      )
      .orderBy(desc(tickets.createdAt)),
    db
      .select({ id: users.id, name: users.name, departmentId: users.departmentId })
      .from(users)
      .where(eq(users.role, "FIELD_WORKER")),
    db.select({ id: departments.id, name: departments.name }).from(departments),
  ]);

  return (
    <DispatchBoard
      tickets={ticketRows.map(({ ticket, department, crew }) => ({
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        severity: ticket.severity,
        status: ticket.status,
        priority: ticket.priority || "NORMAL",
        address: ticket.address,
        department: department?.name || "Unassigned",
        departmentId: ticket.departmentId,
        assignedCrewId: ticket.assignedCrewId,
        assignedCrew: crew?.name || null,
        createdAt: ticket.createdAt.toISOString(),
      }))}
      workers={workers}
      departments={departmentRows}
    />
  );
}

function DispatchSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24" />)}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function ManagerDispatchPage() {
  return (
    <Suspense fallback={<DispatchSkeleton />}>
      <DispatchData />
    </Suspense>
  );
}