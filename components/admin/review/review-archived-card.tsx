"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReviewTicket } from "./review-suspended-card";

interface ReviewDepartment {
  id: string;
  name: string;
}

interface ReviewArchivedCardProps {
  ticket: ReviewTicket;
  departments: ReviewDepartment[];
  selectedDepartmentId: string;
  isPending: boolean;
  isCurrentPending: boolean;
  onDepartmentSelect: (ticketId: string, departmentId: string) => void;
  onAssign: (ticketId: string) => void;
}

export function ReviewArchivedCard({
  ticket,
  departments,
  selectedDepartmentId,
  isPending,
  isCurrentPending,
  onDepartmentSelect,
  onAssign,
}: ReviewArchivedCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 uppercase"
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{ticket.title}</h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>{ticket.status}</span>
              <span>•</span>
              <span>{ticket.priority} priority</span>
              <span>•</span>
              <span>{ticket.eta}</span>
            </div>
          </div>

          <div className="flex w-full max-w-xs gap-2">
            <Select
              value={selectedDepartmentId ?? ""}
              onValueChange={(value) => onDepartmentSelect(ticket.id, value || "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select active department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={isPending || !selectedDepartmentId}
              onClick={() => onAssign(ticket.id)}
            >
              {isCurrentPending ? "Saving..." : "Assign"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
