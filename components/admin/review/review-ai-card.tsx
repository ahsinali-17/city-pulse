"use client";

import { Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReviewTicket } from "./review-suspended-card";

interface ReviewDepartment {
  id: string;
  name: string;
}

interface ReviewAiCardProps {
  ticket: ReviewTicket;
  departments: ReviewDepartment[];
  selectedDepartmentId: string;
  isPending: boolean;
  isCurrentPending: boolean;
  onDepartmentSelect: (ticketId: string, departmentId: string) => void;
  onConfirmRoute: (ticketId: string) => void;
}

export function ReviewAiCard({
  ticket,
  departments,
  selectedDepartmentId,
  isPending,
  isCurrentPending,
  onDepartmentSelect,
  onConfirmRoute,
}: ReviewAiCardProps) {
  const isReturningToManager = selectedDepartmentId === ticket.departmentId;

  return (
    <Card className="border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/20">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200 uppercase"
              >
                {ticket.id}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-200"
              >
                {ticket.department}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <Badge
                variant="outline"
                className="border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-200"
              >
                {ticket.reviewReason === "MANAGER_ESCALATION" ? "Manager escalation" : "AI routing review"}
              </Badge>
              {ticket.aiConfidence !== null && ticket.aiConfidence !== undefined && (
                <span>AI confidence {ticket.aiConfidence.toFixed(2)}</span>
              )}
              <span>•</span>
              <span>{ticket.priority} priority</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {ticket.imageUrl && (
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="border-violet-300 text-violet-800 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-200 dark:hover:bg-violet-950/40"
                    >
                      <Camera className="mr-2 size-4" /> View Image
                    </Button>
                  }
                />
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{ticket.title}</DialogTitle>
                    <DialogDescription>Image evidence associated with the routing review.</DialogDescription>
                  </DialogHeader>
                  <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ticket.imageUrl} alt={ticket.title} className="h-105 w-full object-cover" />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <div className="w-full min-w-45 sm:w-55">
              <Select
                value={selectedDepartmentId ?? ""}
                onValueChange={(value) => onDepartmentSelect(ticket.id, value || "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select correct department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="bg-violet-600 text-white hover:bg-violet-700"
              disabled={isPending || !selectedDepartmentId}
              onClick={() => onConfirmRoute(ticket.id)}
            >
              {isCurrentPending
                ? "Saving..."
                : isReturningToManager
                ? "Return to Manager"
                : "Confirm Route"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
