import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { departments } from "@/lib/db/schema/departments";
import { desc } from "drizzle-orm";
import { StaffManagementClient } from "@/components/admin/staff-management";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function StaffTable() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [allUsers, allDepartments] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)),
    db.select().from(departments),
  ]);

  const serializedUsers = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    departmentId: u.departmentId,
    createdAt: u.createdAt.toISOString(),
  }));

  const serializedDepartments = allDepartments.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <StaffManagementClient
      allUsers={serializedUsers}
      departments={serializedDepartments}
      currentAdminId={session.user.id}
    />
  );
}

function StaffTableSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<StaffTableSkeleton />}>
      <StaffTable />
    </Suspense>
  );
}
