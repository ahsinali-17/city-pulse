import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import { users } from "../schema/users";

export async function seedUsers(db: NeonHttpDatabase<any>) {
  console.log("Seeding Users...");
  const seedPasswordHash = await bcrypt.hash("citypulse123", 12);
  const citizen = await db.insert(users).values({
    id: "usr-citizen-1",
    name: "John Public",
    email: "john.public@example.com",
    passwordHash: seedPasswordHash,
    role: "CITIZEN",
  }).returning();

  const fieldWorker = await db.insert(users).values({
    id: "usr-crew-4",
    name: "Crew #4 (Hydraulic Maintenance)",
    email: "crew4@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "FIELD_WORKER",
    departmentId: "dept-water",
  }).returning();

  const roadsWorker1 = await db.insert(users).values({
    id: "usr-crew-roads-1",
    name: "Crew #7 (Roadway Maintenance)",
    email: "crew7@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "FIELD_WORKER",
    departmentId: "dept-roads",
  }).returning();

   const roadsWorker2 = await db.insert(users).values({
    id: "usr-crew-roads-2",
    name: "Crew #8 (Roadway Maintenance)",
    email: "crew8@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "FIELD_WORKER",
    departmentId: "dept-roads",
  }).returning();

  const electricityWorker1 = await db.insert(users).values({
    id: "usr-crew-electricity-1",
    name: "Crew #12 (Electrical Services)",
    email: "crew12@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "FIELD_WORKER",
    departmentId: "dept-electricity",
  }).returning();

  const electricityWorker2 = await db.insert(users).values({
    id: "usr-crew-electricity-2",
    name: "Crew #13 (Electrical Services)",
    email: "crew13@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "FIELD_WORKER",
    departmentId: "dept-electricity",
  }).returning();

  const dispatcher = await db.insert(users).values({
    id: "usr-dispatcher-1",
    name: "Dispatcher Sarah Jenkins",
    email: "sjenkins@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "MANAGER",
    departmentId: "dept-water",
  }).returning();
  
  const admin = await db.insert(users).values({
    id: "usr-admin-1",
    name: "City Executive Admin",
    email: "admin@citypulse.gov",
    passwordHash: seedPasswordHash,
    role: "ADMIN",
  }).returning();
  
  return { citizen, fieldWorker, roadsWorker1, roadsWorker2, electricityWorker1, electricityWorker2, dispatcher, admin };
}
