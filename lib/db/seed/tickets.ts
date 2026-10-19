import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { tickets } from "../schema/tickets";
import { ticketEvents } from "../schema/ticket-events";

/**
 * Seed tickets are fully self-contained and independent of mock-data.ts.
 *
 * Rules enforced:
 *  - Only assign tickets to ACTIVE departments.
 *  - Only assign field workers that belong to the ticket's department.
 *  - dept-roads and dept-electricity are SUSPENDED (NO_MANAGER) so no tickets
 *    are assigned there — they go to admin review (no assignedCrewId, no dispatch).
 *  - Water dept is ACTIVE with a manager, so water tickets can be dispatched.
 */

interface SeedTicketsDependencies {
  citizenId: string;
  /** usr-crew-4 — Water & Utilities field worker */
  waterWorkerId: string;
}

export async function seedTickets(
  db: NeonHttpDatabase<any>,
  dependencies: SeedTicketsDependencies
) {
  console.log("Seeding Tickets...");

  // ─── Ticket 1: Water Main Burst — ACTIVE dept, dispatched to water worker ───
  const t1Id = "HAZ-8902";
  const t1CreatedAt = new Date("2026-10-05T10:45:00Z");
  const t1DispatchedAt = new Date("2026-10-05T11:15:00Z");

  await db.insert(tickets).values({
    id: t1Id,
    title: "High Pressure Water Main Burst on Elm St",
    category: "Water Leak",
    description:
      "Water gushing from asphalt near sewer grate, causing road erosion and flooding sidewalk.",
    severity: 5,
    status: "DISPATCHED",
    lat: 40.7128,
    lng: -74.006,
    address: "452 Elm Street, Downtown Metroville",
    imageUrl:
      "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
    aiAnalysis: {
      detectedCategory: "Water Infrastructure Failure",
      severityScore: 5,
      severityLabel: "Critical",
      confidenceScore: 97.4,
      explanation:
        "Gemini Vision detected active pressurized water discharge on public asphalt roadway. High risk of sub-base erosion and vehicular hazard.",
      isDuplicate: false,
    },
    timeline: [
      {
        timestamp: "10:45 AM",
        title: "Hazard Submitted",
        description: "Citizen reported issue with camera photo and GPS coordinates.",
        author: "Public Submission",
        iconType: "user",
      },
      {
        timestamp: "10:46 AM",
        title: "Gemini AI Automated Triage",
        description:
          "Assigned 5/5 Critical severity rating. 97.4% vision confidence. 0 duplicates flagged within 100m.",
        author: "Gemini Vision AI Engine",
        iconType: "ai",
      },
      {
        timestamp: "11:15 AM",
        title: "Field Crew Dispatched",
        description: "Dispatcher assigned Crew #4 with emergency priority dispatch order.",
        author: "Dispatcher Sarah Jenkins",
        iconType: "dispatcher",
      },
    ],
    reporterId: dependencies.citizenId,
    assignedCrewId: dependencies.waterWorkerId,
    departmentId: "dept-water",
    createdAt: t1CreatedAt,
    updatedAt: t1DispatchedAt,
  });

  await db.insert(ticketEvents).values({
    id: `event-seed-route-${t1Id}`,
    ticketId: t1Id,
    eventType: "ROUTING_ASSIGNED",
    actorId: dependencies.citizenId,
    toDepartmentId: "dept-water",
    reason: "Initial AI triage and routing assignment",
    createdAt: t1CreatedAt,
  });

  await db.insert(ticketEvents).values({
    id: `event-seed-dispatch-${t1Id}`,
    ticketId: t1Id,
    eventType: "WORKER_ASSIGNED",
    actorId: null,
    fromDepartmentId: "dept-water",
    toDepartmentId: "dept-water",
    reason: "Initial dispatch assignment",
    metadata: {
      assignedCrewId: dependencies.waterWorkerId,
    },
    createdAt: t1DispatchedAt,
  });

  // ─── Ticket 2: Water Hydrant Leak — ACTIVE dept, in progress ─────────────
  const t2Id = "HAZ-8882";
  const t2CreatedAt = new Date("2026-10-05T09:15:00Z");
  const t2WorkStartAt = new Date("2026-10-05T10:00:00Z");

  await db.insert(tickets).values({
    id: t2Id,
    title: "Fire Hydrant Leak Flooding Curb",
    category: "Water Leak",
    description:
      "Hydrant cap seal failure. Steady stream flooding curb lane near Spring St intersection.",
    severity: 3,
    status: "IN_PROGRESS",
    lat: 40.722,
    lng: -74.005,
    address: "Spring Street & Lafayette, Downtown",
    imageUrl:
      "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
    aiAnalysis: {
      detectedCategory: "Hydrant Infrastructure Failure",
      severityScore: 3,
      severityLabel: "Moderate",
      confidenceScore: 88.5,
      explanation:
        "Visible water discharge from hydrant nozzle cap. Risk of pedestrian slip hazard and minor road flooding.",
      isDuplicate: false,
    },
    timeline: [
      {
        timestamp: "09:15 AM",
        title: "Hazard Submitted",
        description: "Reported via mobile PWA portal.",
        author: "Public Submission",
        iconType: "user",
      },
      {
        timestamp: "09:16 AM",
        title: "Gemini AI Triage",
        description: "Severity 3/5 Moderate. 88.5% confidence. No duplicates in 100m radius.",
        author: "Gemini Vision AI Engine",
        iconType: "ai",
      },
      {
        timestamp: "10:00 AM",
        title: "Crew On Site",
        description: "Crew #4 arrived on site. Shut-off valve located 15ft north.",
        author: "Crew #4 (Hydraulic Maintenance)",
        iconType: "field",
      },
    ],
    reporterId: dependencies.citizenId,
    assignedCrewId: dependencies.waterWorkerId,
    departmentId: "dept-water",
    createdAt: t2CreatedAt,
    updatedAt: t2WorkStartAt,
  });

  await db.insert(ticketEvents).values({
    id: `event-seed-route-${t2Id}`,
    ticketId: t2Id,
    eventType: "ROUTING_ASSIGNED",
    actorId: dependencies.citizenId,
    toDepartmentId: "dept-water",
    reason: "Initial AI triage and routing assignment",
    createdAt: t2CreatedAt,
  });

  await db.insert(ticketEvents).values({
    id: `event-seed-dispatch-${t2Id}`,
    ticketId: t2Id,
    eventType: "WORKER_ASSIGNED",
    actorId: null,
    fromDepartmentId: "dept-water",
    toDepartmentId: "dept-water",
    reason: "Initial dispatch assignment",
    metadata: {
      assignedCrewId: dependencies.waterWorkerId,
    },
    createdAt: new Date(t2CreatedAt.getTime() + 30 * 60 * 1000),
  });

  // ─── Ticket 3: Pothole — dept-roads is SUSPENDED, goes to admin review ───
  // No assignedCrewId, no WORKER_ASSIGNED event. Sent to admin queue.
  const t3Id = "HAZ-8899";
  const t3CreatedAt = new Date("2026-10-05T08:00:00Z");

  await db.insert(tickets).values({
    id: t3Id,
    title: "Deep Pothole in Right Lane",
    category: "Pothole",
    description:
      "Deep cavity in right lane near bus stop, approximately 8 inches deep. Flagged as potential duplicate.",
    severity: 4,
    status: "REPORTED",
    lat: 40.718,
    lng: -74.001,
    address: "78 Grand Avenue, Northside",
    imageUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      detectedCategory: "Asphalt Structural Damage",
      severityScore: 4,
      severityLabel: "High",
      confidenceScore: 94.1,
      explanation:
        "Deep roadway depression identified near high-transit lane. Vehicle tire blowout risk.",
      isDuplicate: true,
      duplicateRadiusMeters: 45,
      nearbyDuplicateTicketId: "HAZ-8890",
    },
    timeline: [
      {
        timestamp: "08:00 AM",
        title: "Hazard Submitted",
        description: "Reported via mobile PWA portal.",
        author: "Public Submission",
        iconType: "user",
      },
      {
        timestamp: "08:01 AM",
        title: "Gemini AI Triage",
        description:
          "Flagged potential duplicate with HAZ-8890 (45m radius). Assigned Severity 4/5. Routed to Roads & Transportation dept — currently suspended.",
        author: "Gemini Vision AI Engine",
        iconType: "ai",
      },
    ],
    reporterId: dependencies.citizenId,
    assignedCrewId: null, // dept-roads is SUSPENDED — no assignment possible
    departmentId: "dept-roads",
    createdAt: t3CreatedAt,
    updatedAt: t3CreatedAt,
  });

  // Only routing event — no WORKER_ASSIGNED since dept is suspended
  await db.insert(ticketEvents).values({
    id: `event-seed-route-${t3Id}`,
    ticketId: t3Id,
    eventType: "ROUTING_ASSIGNED",
    actorId: dependencies.citizenId,
    toDepartmentId: "dept-roads",
    reason:
      "Initial AI triage routing. Department currently suspended — ticket held in admin review queue.",
    createdAt: t3CreatedAt,
  });
}
