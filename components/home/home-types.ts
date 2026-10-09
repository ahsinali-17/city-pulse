import type { ElementType } from "react";

export interface HomeStats {
  totalTickets: number;
  resolvedTickets: number;
  activeTickets: number;
  departmentCount: number;
}

export type WorkflowStep = {
  number: string;
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
};