import { Clock, Sparkles, Building2, HardHat, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineEvent {
  iconType?: string;
  title: string;
  timestamp: string;
  description: string;
  author: string;
}

interface TicketTimelineCardProps {
  timeline: any;
}

export function TicketTimelineCard({ timeline }: TicketTimelineCardProps) {
  const events = Array.isArray(timeline) ? (timeline as TimelineEvent[]) : [];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Clock className="size-4 text-blue-600" /> Triage Audit Trail & Timeline
        </CardTitle>
        <CardDescription className="text-xs">
          Chronological log of AI analysis and dispatcher actions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative space-y-6">
          {/* Continuous Vertical Timeline Thread Line */}
          <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800" />

          {events.length > 0 ? (
            events.map((item, index) => (
              <div key={index} className="relative flex items-start gap-3.5 group">
                {/* Circle Node Icon centered over the thread line */}
                <div className="relative z-10 size-7.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-600 flex items-center justify-center text-blue-600 text-xs shrink-0 shadow-xs">
                  {item.iconType === "ai" ? (
                    <Sparkles className="size-3.5 text-blue-600" />
                  ) : item.iconType === "dispatcher" ? (
                    <Building2 className="size-3.5 text-purple-600" />
                  ) : item.iconType === "field" ? (
                    <HardHat className="size-3.5 text-amber-600" />
                  ) : (
                    <User className="size-3.5 text-slate-600" />
                  )}
                </div>

                <div className="space-y-1 flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                    Logged by: {item.author}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 italic pl-8">No timeline events recorded yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
