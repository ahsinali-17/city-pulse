import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface DepartmentProgressItem {
  name: string;
  ongoing: number;
  resolved: number;
}

interface AdminDepartmentProgressProps {
  departmentProgress: DepartmentProgressItem[];
}

export function AdminDepartmentProgress({ departmentProgress }: AdminDepartmentProgressProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/20">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4 text-indigo-500" />
          Department Progress
        </CardTitle>
        <CardDescription>Ongoing versus resolved work in the current dashboard scope.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {departmentProgress.length === 0 ? (
          <p className="text-sm text-muted-foreground">No department activity matches the current filters.</p>
        ) : (
          departmentProgress.map((department) => {
            const total = department.ongoing + department.resolved;
            const resolvedWidth = total === 0 ? 0 : (department.resolved / total) * 100;
            return (
              <div key={department.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {department.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {department.ongoing} ongoing · {department.resolved} resolved
                  </span>
                </div>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/50">
                  <div className="bg-blue-500" style={{ width: `${100 - resolvedWidth}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${resolvedWidth}%` }} />
                </div>
              </div>
            );
          })
        )}
        <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            Ongoing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Resolved
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
