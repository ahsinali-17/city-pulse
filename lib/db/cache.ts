import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { tickets } from "@/lib/db/schema/tickets";
import { users } from "@/lib/db/schema/users";
import { count, eq, inArray, notInArray } from "drizzle-orm";

/**
 * Cached departments list
 * Tag: 'departments'
 * Revalidated when admin creates, suspends, or archives a department.
 */
export const getCachedDepartments = unstable_cache(
  async () => {
    return db.select().from(departments);
  },
  ["departments-all"],
  {
    tags: ["departments"],
    revalidate: 3600, // 1 hour background revalidation
  }
);

/**
 * Cached active departments
 * Tag: 'departments'
 */
export const getCachedActiveDepartments = unstable_cache(
  async () => {
    return db
      .select({ id: departments.id, name: departments.name })
      .from(departments)
      .where(eq(departments.status, "ACTIVE"));
  },
  ["departments-active"],
  {
    tags: ["departments"],
    revalidate: 3600,
  }
);

/**
 * Cached public home page stats
 * Tag: 'home-stats'
 */
export const getCachedHomeStats = unstable_cache(
  async () => {
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
      console.error("[CACHED_HOME_STATS_ERROR]", error);
      return {
        totalTickets: 0,
        resolvedTickets: 0,
        activeTickets: 0,
        departmentCount: 0,
      };
    }
  },
  ["public-home-stats"],
  {
    tags: ["home-stats"],
    revalidate: 300, // 5 minutes
  }
);
