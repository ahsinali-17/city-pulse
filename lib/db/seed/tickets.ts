import { type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { tickets } from "../schema/tickets";
import { MOCK_TICKETS } from "../../mock-data";

export async function seedTickets(db: NeonHttpDatabase<any>, dependencies: { citizenId: string, fieldWorkerId: string }) {
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
      aiAnalysis: mock.aiAnalysis,
      timeline: mock.timeline,
      reporterId: dependencies.citizenId,
      assignedCrewId: mock.assignedCrew ? dependencies.fieldWorkerId : null,
      departmentId: isWater ? "dept-water" : "dept-roads",
      createdAt: new Date(mock.createdAt),
      updatedAt: new Date(mock.updatedAt),
    });
  }
}
