"use server";

import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { ticketEvents } from "@/lib/db/schema/ticket-events";
import { tickets } from "@/lib/db/schema/tickets";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { findDuplicateMatch } from "@/lib/geo";

/** Statuses that mean the ticket is no longer active work. */
const TERMINAL_STATUSES = ["RESOLVED", "COMPLETED"] as const;

/** Radius in metres for proximity duplicate detection. */
const DUPLICATE_RADIUS_METERS = 100;

export type DuplicateCheckResult =
  | { isDuplicate: false }
  | {
      isDuplicate: true;
      existingTicketId: string;
      distanceMeters: number;
      severityMatched: boolean;
    };

/**
 * Checks whether a ticket being submitted is a near-duplicate of an
 * already-active ticket.
 *
 * Requires an active coordinate pair — never classifies without a pin.
 * Distance (Haversine, 100 m) is the required signal. Matching severity
 * confirms the same incident; mismatched severity does not clear a nearby hit.
 */
export async function checkDuplicateAction(data: {
  category: string;
  severity?: number;
  lat: number;
  lng: number;
}): Promise<DuplicateCheckResult> {
  const category = data.category.trim();
  if (!category || !Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
    return { isDuplicate: false };
  }

  const candidates = await db
    .select({
      id: tickets.id,
      lat: tickets.lat,
      lng: tickets.lng,
      severity: tickets.severity,
    })
    .from(tickets)
    .where(
      and(
        eq(tickets.category, category),
        notInArray(tickets.status, [...TERMINAL_STATUSES])
      )
    );

  const match = findDuplicateMatch(
    data.lat,
    data.lng,
    candidates,
    DUPLICATE_RADIUS_METERS,
    data.severity
  );

  if (match) {
    return {
      isDuplicate: true,
      existingTicketId: match.candidate.id,
      distanceMeters: Math.round(match.distanceMeters),
      severityMatched: match.severityMatched,
    };
  }

  return { isDuplicate: false };
}

export type SubmitTicketResult =
  | { success: true; ticketId: string }
  | {
      success: false;
      isDuplicate: true;
      existingTicketId: string;
      distanceMeters: number;
      severityMatched: boolean;
    };

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
}): Promise<SubmitTicketResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const duplicate = await checkDuplicateAction({
    category: data.category,
    severity: data.severity,
    lat: data.lat,
    lng: data.lng,
  });
  if (duplicate.isDuplicate) {
    return { success: false, ...duplicate };
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

  const now = new Date();
  await db.batch([
    db.insert(tickets).values({
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
      routingUpdatedAt: routingCorrectionReason ? now : null,
      createdAt: now,
      updatedAt: now,
    }),
    db.insert(ticketEvents).values({
      id: `event-${crypto.randomUUID()}`,
      ticketId: newId,
      eventType: "ROUTING_ASSIGNED",
      actorId: session.user.id,
      toDepartmentId: departmentId,
      reason: routingCorrectionReason || "AI_INITIAL_ROUTING",
      metadata: {
        category: data.category,
        confidence,
        severity: data.severity,
        priority,
      },
      createdAt: now,
    }),
  ]);

  revalidatePath("/citizen/tickets");
  revalidatePath("/admin");
  return { success: true, ticketId: newId };
}
