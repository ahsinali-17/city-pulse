import { auth } from "@/auth";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema/departments";
import { users } from "@/lib/db/schema/users";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentControl } from "@/components/admin/department-control";

export const dynamic = "force-dynamic";

async function DepartmentData() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [departmentRows, availableWorkers] = await Promise.all([
    db
      .select({ department: departments, manager: users })
      .from(departments)
      .leftJoin(users, and(eq(users.departmentId, departments.id), eq(users.role, "MANAGER"), eq(users.isActive, true)))
      .orderBy(asc(departments.name)),
    db
      .select({ id: users.id, name: users.name, email: users.email, departmentId: users.departmentId })
      .from(users)
      .where(and(eq(users.role, "FIELD_WORKER"), eq(users.isActive, true), isNotNull(users.departmentId)))
      .orderBy(asc(users.name)),
  ]);

  return (
    <DepartmentControl
      departments={departmentRows.map(({ department, manager }) => ({
        id: department.id,
        name: department.name,
        description: department.description,
        status: department.status,
        statusReason: department.statusReason,
        managerAssignedAt: department.managerAssignedAt?.toISOString() || null,
        manager: manager ? { id: manager.id, name: manager.name, email: manager.email } : null,
      }))}
      availableWorkers={availableWorkers}
    />
  );
}

function DepartmentSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}</div>
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default function AdminDepartmentsPage() {
  return <Suspense fallback={<DepartmentSkeleton />}><DepartmentData /></Suspense>;
}