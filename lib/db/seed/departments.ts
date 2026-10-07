import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { departments } from "../schema/departments";

export async function seedDepartments(db: NeonHttpDatabase<any>) {
  console.log("Seeding Departments...");
  const deptWater = await db.insert(departments).values({
    id: "dept-water",
    name: "Water & Utilities Operations",
    description: "Handles water main breaks, leaks, and sewer issues.",
  }).returning();

  const deptRoads = await db.insert(departments).values({
    id: "dept-roads",
    name: "Roads & Transportation",
    description: "Handles potholes, road damage, and bridge maintenance.",
  }).returning();
  
  return { deptWater, deptRoads };
}
