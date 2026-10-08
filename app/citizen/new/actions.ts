"use server";

import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function submitTicketAction(data: {
  title: string;
  category: string;
  description: string;
  severity: number;
  imageUrl: string | null;
  address: string;
  lat: number;
  lng: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const newId = `HAZ-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Assign department based on category
  const departmentId = data.category === "Water Leak" ? "dept-water" : "dept-roads";
  
  // Calculate priority based on severity
  const priority = data.severity === 5 ? "URGENT" : data.severity === 4 ? "HIGH" : data.severity === 3 ? "NORMAL" : "LOW";

  await db.insert(tickets).values({
    id: newId,
    title: data.title,
    category: data.category,
    description: data.description,
    severity: data.severity,
    priority: priority,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    imageUrl: data.imageUrl,
    status: "REPORTED",
    reporterId: session.user.id,
    departmentId: departmentId,
  });

  revalidatePath("/citizen/tickets");
  return { success: true, ticketId: newId };
}
