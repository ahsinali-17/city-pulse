import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { departments, users, tickets } from "./schema";
import { MOCK_TICKETS, MOCK_MAP_INCIDENTS, MOCK_FIELD_TASKS } from "../mock-data";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Seed Departments
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

  // 2. Seed Users
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

  // 3. Seed Tickets (Using MOCK_TICKETS data)
  console.log("Seeding Tickets...");
  for (const key in MOCK_TICKETS) {
    const mock = MOCK_TICKETS[key];
    const isWater = mock.category === "Water Leak";
    
    await db.insert(tickets).values({
      id: mock.id,
      title: mock.title,
      category: mock.category,
      description: mock.description,
      severity: mock.aiAnalysis.severityScore,
      status: mock.status === "DISPATCHED" ? "DISPATCHED" : mock.status === "IN_PROGRESS" ? "IN_PROGRESS" : "REPORTED",
      lat: mock.coordinates.lat,
      lng: mock.coordinates.lng,
      address: mock.address,
      imageUrl: mock.imageUrl,
      reporterId: citizen[0].id,
      assignedCrewId: mock.assignedCrew ? fieldWorker[0].id : null,
      departmentId: isWater ? "dept-water" : "dept-roads",
      createdAt: new Date(mock.createdAt),
      updatedAt: new Date(mock.updatedAt),
    });
  }

  console.log("✅ Seeding completed successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed!");
  console.error(e);
  process.exit(1);
});
