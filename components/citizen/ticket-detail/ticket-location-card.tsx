import { MapPin, HardHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketMapDialog } from "@/components/citizen/ticket-map-dialog";

interface TicketLocationCardProps {
  ticket: {
    id: string;
    title: string | null;
    category?: string | null;
    imageUrl: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    severity?: number | null;
    assignedDepartment: string | null;
    assignedCrew: string | null;
  };
}

export function TicketLocationCard({ ticket }: TicketLocationCardProps) {
  return (
    <div className="space-y-6">
      {/* Photo Evidence Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">Citizen Photo Evidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket?.imageUrl ?? ""}
              alt={ticket.title ?? ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono backdrop-blur-xs">
              GPS Embedded
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location & Department Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <MapPin className="size-4 text-emerald-600" /> Location & Assignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">Address:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {ticket.address || "Unspecified Location"}
            </p>
          </div>

          <div className="pt-2 border-t space-y-2">
            <div>
              <span className="text-muted-foreground text-[11px]">Assigned Department:</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {ticket.assignedDepartment || "Unassigned"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-[11px]">Dispatched Crew:</span>
              <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                <HardHat className="size-3.5" /> {ticket.assignedCrew || "Awaiting Crew Assignment"}
              </p>
            </div>
          </div>

          {ticket.lat != null && ticket.lng != null ? (
            <TicketMapDialog
              ticket={{
                id: ticket.id,
                title: ticket.title || "Hazard Location",
                category: ticket.category || "General",
                address: ticket.address || "Unspecified Location",
                lat: ticket.lat,
                lng: ticket.lng,
                severity: ticket.severity || 1,
              }}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
