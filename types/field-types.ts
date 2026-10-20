export interface FieldTask {
  id: string;
  title: string;
  category: string;
  severity: 1 | 2 | 3 | 4 | 5;
  status: "ASSIGNED" | "EN_ROUTE" | "ON_SITE" | "IN_PROGRESS" | "COMPLETED";
  address: string;
  coordinates: { lat: number; lng: number };
  estimatedMinutes: number;
  reportedAt: string;
  partsNeeded: string[];
  partsUsed: string[];
  notes: string;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  imageUrl: string;
  assignedCrewName: string;
  departmentName?: string;
}
