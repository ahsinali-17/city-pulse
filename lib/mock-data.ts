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

// ============================================================================
// GIS MAP VIEW — MOCK INCIDENT PINS
// ============================================================================

export interface MapIncident {
  id: string;
  title: string;
  category: "Water Leak" | "Pothole" | "Power Outage" | "Traffic Signal" | "Tree Branch" | "Sanitation";
  severity: 1 | 2 | 3 | 4 | 5;
  status: "REPORTED" | "TRIAGED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED";
  coordinates: { lat: number; lng: number };
  address: string;
  reportedAt: string;
  assignedCrew?: string;
  department: string;
}

export const MOCK_MAP_INCIDENTS: MapIncident[] = [
  {
    id: "HAZ-8902",
    title: "High Pressure Water Main Burst",
    category: "Water Leak",
    severity: 5,
    status: "DISPATCHED",
    coordinates: { lat: 40.7128, lng: -74.006 },
    address: "452 Elm Street",
    reportedAt: "10m ago",
    assignedCrew: "Crew #4",
    department: "Water & Utilities",
  },
  {
    id: "HAZ-8899",
    title: "Deep Pothole in Right Lane",
    category: "Pothole",
    severity: 4,
    status: "IN_PROGRESS",
    coordinates: { lat: 40.718, lng: -74.001 },
    address: "78 Grand Avenue",
    reportedAt: "25m ago",
    assignedCrew: "Crew #2",
    department: "Roads & Transportation",
  },
  {
    id: "HAZ-8894",
    title: "Damaged Traffic Signal Controller",
    category: "Traffic Signal",
    severity: 5,
    status: "TRIAGED",
    coordinates: { lat: 40.7282, lng: -73.9942 },
    address: "Route 9 & Broadway",
    reportedAt: "42m ago",
    department: "Traffic Engineering",
  },
  {
    id: "HAZ-8891",
    title: "Fallen Oak Branch Blocking Path",
    category: "Tree Branch",
    severity: 2,
    status: "RESOLVED",
    coordinates: { lat: 40.735, lng: -73.99 },
    address: "Oak Park Pathway",
    reportedAt: "1h ago",
    assignedCrew: "Crew #7",
    department: "Parks & Recreation",
  },
  {
    id: "HAZ-8888",
    title: "Transformer Fire & Blackout",
    category: "Power Outage",
    severity: 5,
    status: "DISPATCHED",
    coordinates: { lat: 40.7484, lng: -73.9856 },
    address: "1501 Broadway",
    reportedAt: "8m ago",
    assignedCrew: "Crew #1",
    department: "Electrical Grid",
  },
  {
    id: "HAZ-8885",
    title: "Overflowing Dumpster & Debris",
    category: "Sanitation",
    severity: 2,
    status: "REPORTED",
    coordinates: { lat: 40.758, lng: -73.9855 },
    address: "W 47th Street",
    reportedAt: "2h ago",
    department: "Sanitation Services",
  },
  {
    id: "HAZ-8882",
    title: "Fire Hydrant Leak Flooding Curb",
    category: "Water Leak",
    severity: 3,
    status: "TRIAGED",
    coordinates: { lat: 40.722, lng: -74.005 },
    address: "Spring Street & Lafayette",
    reportedAt: "55m ago",
    department: "Water & Utilities",
  },
  {
    id: "HAZ-8879",
    title: "Sinkhole Forming Near Intersection",
    category: "Pothole",
    severity: 5,
    status: "DISPATCHED",
    coordinates: { lat: 40.74, lng: -73.989 },
    address: "E 23rd & Park Ave South",
    reportedAt: "18m ago",
    assignedCrew: "Crew #3",
    department: "Roads & Transportation",
  },
  {
    id: "HAZ-8876",
    title: "Pedestrian Signal Stuck on Don't Walk",
    category: "Traffic Signal",
    severity: 3,
    status: "REPORTED",
    coordinates: { lat: 40.715, lng: -74.01 },
    address: "Chambers St & West Broadway",
    reportedAt: "1.5h ago",
    department: "Traffic Engineering",
  },
  {
    id: "HAZ-8873",
    title: "Uprooted Tree on Sidewalk",
    category: "Tree Branch",
    severity: 4,
    status: "DISPATCHED",
    coordinates: { lat: 40.76, lng: -73.97 },
    address: "Central Park South",
    reportedAt: "30m ago",
    assignedCrew: "Crew #7",
    department: "Parks & Recreation",
  },
  {
    id: "HAZ-8870",
    title: "Flickering Streetlights (Block-wide)",
    category: "Power Outage",
    severity: 3,
    status: "IN_PROGRESS",
    coordinates: { lat: 40.732, lng: -74.002 },
    address: "W Houston & 6th Avenue",
    reportedAt: "45m ago",
    assignedCrew: "Crew #5",
    department: "Electrical Grid",
  },
  {
    id: "HAZ-8867",
    title: "Illegal Dumping Behind Storefront",
    category: "Sanitation",
    severity: 1,
    status: "REPORTED",
    coordinates: { lat: 40.745, lng: -73.978 },
    address: "E 34th Street",
    reportedAt: "3h ago",
    department: "Sanitation Services",
  },
  {
    id: "HAZ-8864",
    title: "Multiple Potholes on Bridge Approach",
    category: "Pothole",
    severity: 4,
    status: "TRIAGED",
    coordinates: { lat: 40.705, lng: -74.013 },
    address: "Brooklyn Bridge Approach",
    reportedAt: "1h ago",
    department: "Roads & Transportation",
  },
  {
    id: "HAZ-8861",
    title: "Underground Pipe Seepage",
    category: "Water Leak",
    severity: 3,
    status: "IN_PROGRESS",
    coordinates: { lat: 40.719, lng: -73.995 },
    address: "Delancey & Allen Streets",
    reportedAt: "2h ago",
    assignedCrew: "Crew #4",
    department: "Water & Utilities",
  },
];

// ============================================================================
// FIELD WORKER — OFFLINE TASK QUEUE (Crew #4)
// ============================================================================

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
}

export const MOCK_FIELD_TASKS: FieldTask[] = [
  {
    id: "HAZ-8902",
    title: "High Pressure Water Main Burst",
    category: "Water Leak",
    severity: 5,
    status: "ASSIGNED",
    address: "452 Elm Street, Downtown",
    coordinates: { lat: 40.7128, lng: -74.006 },
    estimatedMinutes: 45,
    reportedAt: "10 min ago",
    partsNeeded: ["6\" Gate Valve", "Pipe Clamp", "Coupling Sleeve"],
    partsUsed: [],
    notes: "Active pressurized water discharge on roadway. Road closure team notified. Approach from 5th Ave side.",
    priority: "URGENT",
    imageUrl: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "HAZ-8879",
    title: "Sinkhole Forming Near Intersection",
    category: "Pothole",
    severity: 5,
    status: "ASSIGNED",
    address: "E 23rd & Park Ave South",
    coordinates: { lat: 40.74, lng: -73.989 },
    estimatedMinutes: 90,
    reportedAt: "18 min ago",
    partsNeeded: ["Cold Patch Asphalt (x5)", "Barrier Cones (x12)", "Steel Plate Cover"],
    partsUsed: [],
    notes: "Sinkhole approximately 3ft diameter. Utility company checking for pipe damage below. Await all-clear before approach.",
    priority: "URGENT",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "HAZ-8861",
    title: "Underground Pipe Seepage",
    category: "Water Leak",
    severity: 3,
    status: "EN_ROUTE",
    address: "Delancey & Allen Streets",
    coordinates: { lat: 40.719, lng: -73.995 },
    estimatedMinutes: 60,
    reportedAt: "2 hours ago",
    partsNeeded: ["Pipe Sleeve (4\")", "Leak Repair Clamp"],
    partsUsed: [],
    notes: "Slow seepage from underground joint. No road flooding yet. Inspect for cracks before excavation.",
    priority: "HIGH",
    imageUrl: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "HAZ-8899",
    title: "Deep Pothole in Right Lane",
    category: "Pothole",
    severity: 4,
    status: "IN_PROGRESS",
    address: "78 Grand Avenue, Northside",
    coordinates: { lat: 40.718, lng: -74.001 },
    estimatedMinutes: 30,
    reportedAt: "25 min ago",
    partsNeeded: ["Hot Asphalt Mix (x3)", "Tamper Tool"],
    partsUsed: ["Hot Asphalt Mix (x2)"],
    notes: "8-inch deep cavity near bus stop. High traffic area. Temporary cold patch applied, hot mix underway.",
    priority: "HIGH",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "HAZ-8882",
    title: "Fire Hydrant Leak Flooding Curb",
    category: "Water Leak",
    severity: 3,
    status: "ON_SITE",
    address: "Spring Street & Lafayette",
    coordinates: { lat: 40.722, lng: -74.005 },
    estimatedMinutes: 40,
    reportedAt: "55 min ago",
    partsNeeded: ["Hydrant Wrench", "Gasket Kit", "Nozzle Cap"],
    partsUsed: ["Hydrant Wrench"],
    notes: "Hydrant cap seal failure. Steady stream flooding curb lane. Shut-off valve located 15ft north.",
    priority: "NORMAL",
    imageUrl: "https://images.unsplash.com/photo-1686890363933-4a1125d4e3b0?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: "HAZ-8891",
    title: "Fallen Oak Branch Blocking Path",
    category: "Tree Branch",
    severity: 2,
    status: "COMPLETED",
    address: "Oak Park Pathway",
    coordinates: { lat: 40.735, lng: -73.99 },
    estimatedMinutes: 20,
    reportedAt: "1 hour ago",
    partsNeeded: ["Chainsaw Fuel", "Safety Tape"],
    partsUsed: ["Chainsaw Fuel", "Safety Tape"],
    notes: "Branch removed and path cleared. Stump ground flush. Area safe for foot traffic.",
    priority: "LOW",
    imageUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
  },
];
