"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function requireDispatcher() {
  const session = await auth();
  if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
    throw new Error("Unauthorized: manager access required.");
  }
}

export async function assignTicket(ticketId: string, workerId: string | null) {
  await requireDispatcher();

  if (workerId) {
    const worker = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, workerId));

    if (worker.length === 0) {
      throw new Error("That field worker no longer exists.");
    }
  }

  await db
    .update(tickets)
    .set({
      assignedCrewId: workerId,
      status: workerId ? "DISPATCHED" : "TRIAGED",
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/field");
}

export async function overrideTicketSeverity(ticketId: string, severity: number) {
  await requireDispatcher();

  if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
    throw new Error("Severity must be an integer from 1 to 5.");
  }

  await db
    .update(tickets)
    .set({ severity, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/manager/dispatch");
  revalidatePath("/manager/map");
}