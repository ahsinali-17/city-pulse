import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { departments } from "../schema/departments";

export async function seedDepartments(db: NeonHttpDatabase<any>) {
  console.log("Seeding Departments...");
  const deptWater = await db.insert(departments).values({
    id: "dept-water",
    name: "Water & Utilities Operations",
    description: "Handles water main breaks, leaks, and sewer issues.",
    status: "ACTIVE",
    statusReason: null,
    managerAssignedAt: new Date(),
  }).returning();

  const deptRoads = await db.insert(departments).values({
    id: "dept-roads",
    name: "Roads & Transportation",
    description: "Handles potholes, road damage, and bridge maintenance.",
    status: "SUSPENDED",
    statusReason: "NO_MANAGER",
  }).returning();

  const deptElectricity = await db.insert(departments).values({
    id: "dept-electricity",
    name: "Electricity Operations",
    description: "Handles streetlights, power faults, and electrical hazards.",
    status: "SUSPENDED",
    statusReason: "NO_MANAGER",
  }).returning();
  
  return { deptWater, deptRoads, deptElectricity };
}
