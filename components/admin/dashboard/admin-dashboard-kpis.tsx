import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardKpisProps {
  totalTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  urgentTickets: number;
}

export function AdminDashboardKpis({
  totalTickets,
  resolvedTickets,
  inProgressTickets,
  urgentTickets,
}: AdminDashboardKpisProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{totalTickets}</div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Resolved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {resolvedTickets}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-blue-200 dark:border-blue-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Active / En Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {inProgressTickets}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="size-3.5" /> Urgent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-red-600 dark:text-red-400">
            {urgentTickets}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
