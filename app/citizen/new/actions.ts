"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { and, eq, inArray } from "drizzle-orm";
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
  aiConfidence: number;
  aiAnalysis: Record<string, unknown>;
  aiSuggestedDepartmentId: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const newId = `HAZ-${Math.floor(10000 + Math.random() * 90000)}`;
  
  const confidence = Math.max(0, Math.min(100, data.aiConfidence));
  const [department] = data.aiSuggestedDepartmentId
    ? await db
      .select({ id: departments.id, status: departments.status })
      .from(departments)
      .where(and(
        eq(departments.id, data.aiSuggestedDepartmentId),
        inArray(departments.status, ["ACTIVE", "SUSPENDED"]),
      ))
    : [];
  const departmentId = department?.id ?? null;
  const routingCorrectionReason = !departmentId
    ? "AI_NO_DEPARTMENT_MATCH"
    : department.status === "SUSPENDED"
      ? "DEPARTMENT_UNAVAILABLE"
      : confidence < 40
        ? "LOW_AI_CONFIDENCE"
        : null;
  
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
    aiAnalysis: data.aiAnalysis,
    aiConfidence: confidence,
    aiSuggestedDepartmentId: department?.id ?? null,
    routingSource: "AI",
    routingReviewStatus: routingCorrectionReason ? "NEEDS_ADMIN_REVIEW" : "NONE",
    routingCorrectionReason,
    routingUpdatedAt: routingCorrectionReason ? new Date() : null,
  });

  revalidatePath("/citizen/tickets");
  revalidatePath("/admin");
  return { success: true, ticketId: newId };
}
