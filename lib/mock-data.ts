export interface MockTicket {
  id: string;
  category: "Pothole" | "Water Leak" | "Power Outage" | "Traffic Signal" | "Tree Branch" | "Sanitation";
  title: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  status: "REPORTED" | "TRIAGED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  aiAnalysis: {
    detectedCategory: string;
    severityScore: number; // 1 to 5
    severityLabel: "Low" | "Moderate" | "High" | "Critical";
    confidenceScore: number; // percentage
    explanation: string;
    isDuplicate: boolean;
    duplicateRadiusMeters?: number;
    nearbyDuplicateTicketId?: string;
  };
  assignedDepartment?: string;
  assignedCrew?: string;
  timeline: {
    timestamp: string;
    title: string;
    description: string;
    author: string;
    iconType: "user" | "ai" | "dispatcher" | "field";
  }[];
}

export const MOCK_TICKETS: Record<string, MockTicket> = {
  "demo-123": {
    id: "HAZ-8902",
    category: "Water Leak",
    title: "High Pressure Water Main Burst on Elm St",
    description: "Water gushing from asphalt near sewer grate, causing road erosion and flooding sidewalk.",
    address: "452 Elm Street, Downtown Metroville",
    coordinates: { lat: 40.7128, lng: -74.006 },
    status: "DISPATCHED",
    createdAt: "2026-10-05T10:45:00Z",
    updatedAt: "2026-10-05T11:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHdhdGVyJTIwbGVha2FnZXxlbnwwfHwwfHx8MA%3D%3D",
    aiAnalysis: {
      detectedCategory: "Water Infrastructure Failure",
      severityScore: 5,
      severityLabel: "Critical",
      confidenceScore: 97.4,
      explanation: "Gemini Vision detected active pressurized water discharge on public asphalt roadway. High risk of sub-base erosion and vehicular hazard.",
      isDuplicate: false,
    },
    assignedDepartment: "Water & Utilities Operations",
    assignedCrew: "Crew #4 (Hydraulic Maintenance)",
    timeline: [
      {
        timestamp: "10:45 AM",
        title: "Hazard Submitted",
        description: "Citizen reported issue with camera photo and GPS coordinates.",
        author: "Public Submission",
        iconType: "user",
      },
      {
        timestamp: "10:46 AM",
        title: "Gemini AI Automated Triage",
        description: "Assigned 5/5 Critical severity rating. 97.4% vision confidence. 0 duplicates flagged within 100m.",
        author: "Gemini Vision AI Engine",
        iconType: "ai",
      },
      {
        timestamp: "11:15 AM",
        title: "Field Crew Dispatched",
        description: "Dispatcher assigned Crew #4 with emergency priority dispatch order.",
        author: "Dispatcher Sarah Jenkins",
        iconType: "dispatcher",
      },
    ],
  },
  "demo-456": {
    id: "HAZ-8899",
    category: "Pothole",
    title: "Deep Pothole in Right Lane",
    description: "Deep cavity in right lane near bus stop, approximately 8 inches deep.",
    address: "78 Grand Avenue, Northside",
    coordinates: { lat: 40.718, lng: -74.001 },
    status: "IN_PROGRESS",
    createdAt: "2026-10-05T09:15:00Z",
    updatedAt: "2026-10-05T11:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      detectedCategory: "Asphalt Structural Damage",
      severityScore: 4,
      severityLabel: "High",
      confidenceScore: 94.1,
      explanation: "Deep roadway depression identified near high-transit lane. Vehicle tire blowout risk.",
      isDuplicate: true,
      duplicateRadiusMeters: 45,
      nearbyDuplicateTicketId: "HAZ-8890",
    },
    assignedDepartment: "Roads & Transportation",
    assignedCrew: "Asphalt Patch Crew #2",
    timeline: [
      {
        timestamp: "09:15 AM",
        title: "Hazard Submitted",
        description: "Reported via mobile PWA portal.",
        author: "Public Submission",
        iconType: "user",
      },
      {
        timestamp: "09:16 AM",
        title: "Gemini AI Triage",
        description: "Flagged potential duplicate with HAZ-8890 (45m radius). Assigned Severity 4/5.",
        author: "Gemini Vision AI Engine",
        iconType: "ai",
      },
      {
        timestamp: "11:30 AM",
        title: "Work In Progress",
        description: "Crew #2 arrived on site. Logged 2x Hot Asphalt Bags used.",
        author: "Field Tech Mark Vance",
        iconType: "field",
      },
    ],
  },
};
