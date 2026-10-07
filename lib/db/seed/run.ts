import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import { seedDepartments } from "./departments";
import { seedUsers } from "./users";
import { seedTickets } from "./tickets";
import * as departments from "../schema/departments";
import * as users from "../schema/users";
import * as tickets from "../schema/tickets";
import * as relations from "../schema/relations";

const schema = { ...departments, ...users, ...tickets, ...relations };

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("🌱 Starting Database Seeding...");

  console.log("Clearing existing data...");
  await db.delete(schema.tickets);
  await db.delete(schema.users);
  await db.delete(schema.departments);

  await seedDepartments(db);
  const seededUsers = await seedUsers(db);
  await seedTickets(db, {
    citizenId: seededUsers.citizen[0].id,
    fieldWorkerId: seededUsers.fieldWorker[0].id,
  });

  console.log("✅ Seeding completed successfully!");
}

main().catch((e) => {
  console.error("❌ Seeding failed!");
  console.error(e);
  process.exit(1);
});
