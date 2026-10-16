"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicSingleTicketMap = dynamic(
  () => import("@/components/citizen/single-ticket-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-85 rounded-lg" />,
  }
);

interface TicketMapDialogProps {
  ticket: {
    id: string;
    title: string;
    category: string;
    address: string;
    lat: number;
    lng: number;
    severity: number;
  };
}

export function TicketMapDialog({ ticket }: TicketMapDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-1.5 w-full text-xs font-medium h-8 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 mt-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-100"
      >
        <Compass className="size-3.5 text-blue-600" />
        <span>View on GIS Map</span>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="size-4 text-emerald-600" /> Hazard GIS Coordinates
            </DialogTitle>
            <Badge
              className={`text-[10px] font-mono text-white ${
                ticket.severity >= 4 ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              Severity {ticket.severity}/5
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Pinpoint location on OpenStreetMap for #{ticket.id} ({ticket.title})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Map Container */}
          <div className="w-full h-85 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative z-0">
            {open && (
              <DynamicSingleTicketMap
                lat={ticket.lat}
                lng={ticket.lng}
                title={ticket.title}
                address={ticket.address}
                severity={ticket.severity}
              />
            )}
          </div>

          {/* Coordinate Meta Info */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{ticket.address}</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
              Coordinates: {ticket.lat.toFixed(5)}, {ticket.lng.toFixed(5)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
