import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { departments } from "@/lib/db/schema/departments";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { MapDashboardWrapper } from "@/components/map/map-dashboard-wrapper";

export default async function GISMapPage() {
   const data = await db
    .select({
      ticket: tickets,
      department: departments,
      crew: users,
    })
    .from(tickets)
    .leftJoin(departments, eq(tickets.departmentId, departments.id))
    .leftJoin(users, eq(tickets.assignedCrewId, users.id));

  // Map to the format the MapDashboard expects
  const mappedIncidents = data.map(({ ticket, department, crew }) => {
    return {
      id: ticket.id,
      title: ticket.title,
      category: ticket.category,
      severity: ticket.severity,
      status: ticket.status,
      coordinates: { lat: ticket.lat, lng: ticket.lng },
      address: ticket.address,
      reportedAt: ticket.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
