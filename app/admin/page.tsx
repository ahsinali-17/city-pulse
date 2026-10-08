import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema/tickets";
import { desc } from "drizzle-orm";
import { AdminDashboardClient } from "@/components/admin/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));

  // Serialize for the client component
  const serializedTickets = allTickets.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    status: t.status,
    priority: t.priority ?? "NORMAL",
    severity: t.severity ?? 0,
    address: t.address,
    createdAt: t.createdAt.toISOString(),
  }));

  return <AdminDashboardClient allTickets={serializedTickets} />;
}
