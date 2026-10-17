"use server";

import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";

export async function updateTicketState(
  ticketId: string, 
  newStatus: string, 
  partsNeeded: string[],
  partsUsed: string[]
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "FIELD_WORKER") {
    throw new Error("Unauthorized: Only assigned field workers can update ticket execution state.");
  }

  // Update the ticket in the database
  await db
    .update(tickets)
    .set({ 
      status: newStatus as any, 
      partsNeeded: partsNeeded,
      partsUsed: partsUsed 
    })
    .where(eq(tickets.id, ticketId));

  // Revalidate the field page so it fetches the fresh data
  revalidatePath("/field");
}
