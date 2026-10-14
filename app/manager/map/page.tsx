import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { departments } from "@/lib/db/schema/departments";
import { users } from "@/lib/db/schema/users";
import { and, eq, notInArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MapDashboardWrapper } from "@/components/map/map-dashboard-wrapper";

export const dynamic = "force-dynamic";

export default async function GISMapPage() {
  const session = await auth();

  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  const [currentUser] = await db
    .select({
      role: users.role,
      departmentId: users.departmentId,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!currentUser || !currentUser.isActive || currentUser.role !== session.user.role) {
    redirect("/");
  }

  const managerDepartmentScope =
    session.user.role === "MANAGER"
      ? currentUser.departmentId
        ? eq(tickets.departmentId, currentUser.departmentId)
        : null
      : null;

  if (session.user.role === "MANAGER" && !managerDepartmentScope) {
    redirect("/");
  }

  const data = await db
    .select({
      ticket: tickets,
      department: departments,
      crew: users,
    })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .leftJoin(users, eq(tickets.assignedCrewId, users.id))
    .where(
      and(
        notInArray(tickets.status, ["RESOLVED", "COMPLETED"]),
        managerDepartmentScope ?? undefined,
      ),
    );

  const mappedIncidents = data.map(({ ticket, department, crew }) => {
    return {
      id: ticket.id,
      title: ticket.title,
      category: ticket.category,
      severity: ticket.severity,
      status: ticket.status,
      departmentStatus: department?.status || "ACTIVE",
      coordinates: { lat: ticket.lat, lng: ticket.lng },
      address: ticket.address,
      reportedAt: ticket.createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      assignedCrew: crew ? crew.name : undefined,
      department: department ? department.name : "Unassigned",
    };
  });

  return (
    <div className="h-[calc(100vh-7.5rem)]">
      <MapDashboardWrapper incidents={mappedIncidents} />
    </div>
  );
}
