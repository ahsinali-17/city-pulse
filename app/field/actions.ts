"use server";

import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTicketState(
  ticketId: string, 
  newStatus: string, 
  partsNeeded: string[],
  partsUsed: string[]
) {
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
