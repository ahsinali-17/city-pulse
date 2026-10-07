import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { users } from "../schema/users";

export async function seedUsers(db: NeonHttpDatabase<any>) {
  console.log("Seeding Users...");
  const citizen = await db.insert(users).values({
    id: "usr-citizen-1",
    name: "John Public",
    email: "john.public@example.com",
    role: "CITIZEN",
  }).returning();

  const fieldWorker = await db.insert(users).values({
    id: "usr-crew-4",
    name: "Crew #4 (Hydraulic Maintenance)",
    email: "crew4@citypulse.gov",
    role: "FIELD_WORKER",
    departmentId: "dept-water",
  }).returning();

  const dispatcher = await db.insert(users).values({
    id: "usr-dispatcher-1",
    name: "Dispatcher Sarah Jenkins",
    email: "sjenkins@citypulse.gov",
    role: "MANAGER",
    departmentId: "dept-water",
  }).returning();
  
  return { citizen, fieldWorker, dispatcher };
}
