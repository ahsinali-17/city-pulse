"use client";

import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface ReviewTicket {
  id: string;
  title: string;
  department: string;
  departmentId?: string | null;
  status: string;
  priority: string;
  eta: string;
  imageUrl?: string | null;
  aiConfidence?: number | null;
  reviewReason?: string | null;
  reviewSource?: string | null;
}

interface ReviewSuspendedCardProps {
  ticket: ReviewTicket;
  isPending: boolean;
  isCurrentPending: boolean;
  onFreezeAndNotify: (ticketId: string) => void;
}

export function ReviewSuspendedCard({
  ticket,
  isPending,
  isCurrentPending,
  onFreezeAndNotify,
}: ReviewSuspendedCardProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 uppercase"
              >
                {ticket.id}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {ticket.department}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{ticket.status}</span>
              <span>•</span>
              <span>{ticket.priority} priority</span>
              <span>•</span>
              <span>{ticket.eta}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-950/40"
                  >
                    <TriangleAlert className="mr-2 size-4" /> Freeze & Notify
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Freeze and notify this department?</DialogTitle>
                  <DialogDescription>
                    This suspended department ticket will be held for admin attention and the manager will be notified.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancel</Button>} />
                  <DialogClose
                    render={
                      <Button
                        className="bg-amber-600 text-white hover:bg-amber-700"
                        disabled={isPending}
                        onClick={() => onFreezeAndNotify(ticket.id)}
                      >
                        {isCurrentPending ? "Freezing..." : "Confirm Freeze"}
                      </Button>
                    }
                  />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link
              href={`/manager/dispatch?ticketId=${ticket.id}`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-slate-900 px-2.5 text-sm font-medium whitespace-nowrap text-white transition-all hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Act as Manager (Assign)
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
