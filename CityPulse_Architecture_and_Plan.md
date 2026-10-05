# CityPulse Triage: Product Requirements & Implementation Plan

## 1. Product Overview & Mission

**CityPulse Triage** is a Smart City Infrastructure Hub designed to streamline municipal hazard reporting and repair workflows. It bridges the gap between citizens reporting local issues (potholes, water leaks, power outages) and the city workers dispatched to fix them.

The system relies on an offline-first Progressive Web App (PWA) architecture for field workers in areas with poor cellular service, and Google Gemini AI to automatically categorize and assess the severity of citizen-submitted hazard photos.

## 2. Core User Personas & Features

The application strictly enforces Role-Based Access Control (RBAC) across four user types:

- **1. Citizens (Public):**
  - _Features:_ Can submit hazard tickets using their device camera and GPS. Can track the status of their submitted tickets.
  - _AI Integration:_ Their submissions are analyzed by Gemini Vision to detect the hazard type, assign a 1-5 severity score, and flag potential duplicates within a 100-meter radius.
- **2. Field Workers (Municipal Crew):**
  - _Features:_ Access a mobile-optimized PWA. Can view assigned task queues, log inventory parts used (e.g., "3m copper pipe"), and update ticket statuses (In Progress -> Resolved) completely offline. Data syncs when network returns.
- **3. Department Managers (Dispatchers):**
  - _Features:_ Access a desktop Geospatial (GIS) map dashboard. Can view incident clusters, override AI severity scores, dispatch field workers to tickets, and monitor departmental inventory levels.
- **4. City Admins (Executive):**
  - _Features:_ Global system visibility. Can provision new internal staff accounts (Managers/Field Workers), track cross-department resolution times, and generate automated PDF compliance audits.

## 3. Application Route Map

- `/` - Public landing page
- `/login` & `/signup` - Authentication (Self-signup defaults to Citizen)
- `/citizen/new` - Hazard submission form (Camera & Geolocation)
- `/citizen/tickets/[id]` - Citizen's view of their ticket status
- `/field` - Field worker's offline-capable task queue
- `/manager/map` - Dispatcher's GIS interactive map
- `/manager/dispatch` - Ticket assignment and severity override interface
- `/admin` - System analytics and PDF export hub
- `/admin/users` - Internal staff onboarding portal

## 4. Technical Stack & Performance Rules

- **Framework:** Next.js 14/15 (App Router, Server Components default)
- **UI/UX:** Tailwind CSS, Shadcn UI (Civic theme: Slate, Off-White, High-Contrast Status Badges)
- **Database:** Neon Serverless PostgreSQL & Drizzle ORM
- **Auth:** NextAuth.js v5 (JWT-based RBAC)
- **Performance Guardrails:**
  - Default to React Server Components. Only use `"use client"` at the lowest possible leaf node.
  - Wrap all data fetching and `useSearchParams()` in `<Suspense>` boundaries.
  - Build the UI with static mock data first. Do not connect backend logic until the UI slice is approved.

---

## 5. Execution Strategy: UI-First Vertical Slices

**RULE:** Every slice must be built using static JSON mock data first. The UI must be fully clickable and compile cleanly before backend integration begins. Complete one slice fully before moving to the next.

### Phase 1: Visual Foundation (Mocks Only)

- **Slice 1:** Initialize Next.js, Tailwind, and Shadcn UI. Set up global layouts and navigation shell.
- **Slice 2:** Build `/citizen/new` submission form and `/citizen/tickets/[id]` view using mock JSON tickets.
- **Slice 3:** Build `/manager/map` dashboard using Leaflet and mock incident pins. Build `/field` mobile task list.

### Phase 2: Database & Authentication

- **Slice 4:** Configure Drizzle ORM, define PostgreSQL schemas (`users`, `departments`, `tickets`), and seed Neon database.
- **Slice 5:** Implement NextAuth v5 credentials/OAuth. Write Next.js middleware using JWT claims to protect the routes built in Phase 1.

### Phase 3: Live Data Wiring & AI

- **Slice 6:** Replace all static JSON mocks with live Drizzle database queries wrapped in `<Suspense>`.
- **Slice 7:** Build `/api/triage` Route Handler. Wire the Citizen submission form to the Gemini API for image parsing and severity scoring.

### Phase 4: PWA, Offline Sync & Export

- **Slice 8:** Configure `manifest.json` and Dexie.js for IndexedDB offline caching. Implement background sync for Field Workers.
- **Slice 9:** Build the dynamic executive report exporter using `@react-pdf/renderer`.
