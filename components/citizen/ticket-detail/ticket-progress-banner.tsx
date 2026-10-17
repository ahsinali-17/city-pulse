import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function getTicketProgress(status: string) {
  switch (status) {
    case "REPORTED":
      return 20;
    case "TRIAGED":
      return 40;
    case "DISPATCHED":
      return 60;
    case "IN_PROGRESS":
      return 80;
    case "RESOLVED":
      return 100;
    default:
      return 20;
  }
}

interface TicketProgressBannerProps {
  title: string;
  status: string;
}

export function TicketProgressBanner({ title, status }: TicketProgressBannerProps) {
  const progress = getTicketProgress(status);

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-linear-to-r from-slate-900 via-slate-850 to-blue-950 text-white overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-medium text-blue-400 uppercase tracking-wider">
              Triage Lifecycle Stage
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">{title}</h2>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-500/20 text-blue-300 border-blue-400/40 text-xs self-start sm:self-auto font-mono"
          >
            Est. Resolution: &lt; 2 Hours
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-slate-800 [&>div]:bg-blue-500" />
          <div className="grid grid-cols-5 text-[10px] sm:text-xs font-mono text-slate-400 pt-1">
            <span className={progress >= 20 ? "text-blue-400 font-semibold" : ""}>1. Reported</span>
            <span className={progress >= 40 ? "text-blue-400 font-semibold" : ""}>2. AI Triaged</span>
            <span className={progress >= 60 ? "text-blue-400 font-semibold" : ""}>3. Dispatched</span>
            <span className={progress >= 80 ? "text-blue-400 font-semibold text-center" : "text-center"}>
              4. In Progress
            </span>
            <span className={progress >= 100 ? "text-emerald-400 font-semibold text-right" : "text-right"}>
              5. Resolved
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
