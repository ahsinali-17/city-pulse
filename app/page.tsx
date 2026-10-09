import { count, inArray, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { HomePage, type HomeStats } from "@/components/home/home-page";

export const dynamic = "force-dynamic";

async function getHomeStats(): Promise<HomeStats> {
  try {
    const [total, resolved, active, departmentTotal] = await Promise.all([
      db.select({ value: count() }).from(tickets),
      db
        .select({ value: count() })
        .from(tickets)
        .where(inArray(tickets.status, ["RESOLVED", "COMPLETED"])),
      db
        .select({ value: count() })
        .from(tickets)
        .where(notInArray(tickets.status, ["RESOLVED", "COMPLETED"])),
      db.select({ value: count() }).from(departments),
    ]);

    return {
      totalTickets: total[0]?.value ?? 0,
      resolvedTickets: resolved[0]?.value ?? 0,
      activeTickets: active[0]?.value ?? 0,
      departmentCount: departmentTotal[0]?.value ?? 0,
    };
  } catch (error) {
    console.error("Failed to load public home statistics:", error);
    return {
      totalTickets: 0,
      resolvedTickets: 0,
      activeTickets: 0,
      departmentCount: 0,
    };
  }
}

export default async function Home() {
  const stats = await getHomeStats();
  return <HomePage stats={stats} />;
}
