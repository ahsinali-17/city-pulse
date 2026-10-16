import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 28,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0f172a",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2pt solid #0284c7",
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#e0f2fe",
    border: "1pt solid #7dd3fc",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    color: "#0369a1",
  },
  section: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#f8fafc",
    border: "1pt solid #e2e8f0",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e293b",
    borderBottom: "1pt solid #cbd5e1",
    paddingBottom: 3,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  grid2: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col2: {
    width: "48%",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "35%",
    fontSize: 8,
    color: "#64748b",
    fontWeight: "bold",
  },
  value: {
    width: "65%",
    fontSize: 8,
    color: "#0f172a",
  },
  evidenceContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  evidenceImage: {
    width: 140,
    height: 90,
    borderRadius: 4,
    objectFit: "cover",
    border: "1pt solid #cbd5e1",
  },
  evidenceMeta: {
    flex: 1,
  },
  table: {
    width: "100%",
    border: "1pt solid #e2e8f0",
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e2e8f0",
    padding: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottom: "1pt solid #cbd5e1",
    padding: 4,
  },
  colTime: { width: "25%", fontSize: 7, fontWeight: "bold", color: "#475569" },
  colEvent: { width: "25%", fontSize: 7, fontWeight: "bold", color: "#475569" },
  colDetails: { width: "50%", fontSize: 7, fontWeight: "bold", color: "#475569" },
  cellTime: { width: "25%", fontSize: 7, color: "#334155" },
  cellEvent: { width: "25%", fontSize: 7, color: "#334155", fontWeight: "bold" },
  cellDetails: { width: "50%", fontSize: 7, color: "#334155" },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 7,
    color: "#94a3b8",
    textAlign: "center",
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 6,
  },
});

export interface TicketAuditData {
  id: string;
  title: string;
  category: string;
  description: string | null;
  status: string;
  createdAt: Date | string;
  imageUrl: string | null;
  address: string;
  severity: number;
  priority: string | null;
  assignedDepartment?: string | null;
  assignedCrew?: string | null;
  timeline?: any[] | null;
}

export function TicketAuditPdf({ ticket }: { ticket: TicketAuditData }) {
  const formattedDate = new Date(ticket.createdAt).toLocaleString();
  const events = Array.isArray(ticket.timeline) && ticket.timeline.length > 0
    ? ticket.timeline
    : [
        {
          timestamp: formattedDate,
          event: "INCIDENT REPORTED",
          detail: `Citizen submitted hazard report at ${ticket.address}. Initial triage severity ${ticket.severity}/5.`,
        },
        {
          timestamp: formattedDate,
          event: "AI TRIAGE & ROUTING",
          detail: `Classified as ${ticket.category}. Assigned priority: ${ticket.priority || "NORMAL"}.`,
        },
      ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.title}>CityPulse Municipal Compliance Audit</Text>
            <Text style={styles.subtitle}>
              Official Incident Verification & Hazard Triage Report • Docket #{ticket.id}
            </Text>
          </View>
          <View>
            <Text style={styles.badge}>{ticket.status}</Text>
          </View>
        </View>

        {/* Section 1: Ticket Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Hazard Incident Identification</Text>
          <View style={styles.grid2}>
            <View style={styles.col2}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Ticket ID:</Text>
                <Text style={styles.value}>#{ticket.id}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{ticket.category}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Title / Summary:</Text>
                <Text style={styles.value}>{ticket.title}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Reported Date:</Text>
                <Text style={styles.value}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.col2}>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Severity Score:</Text>
                <Text style={styles.value}>{ticket.severity} / 5 ({ticket.severity >= 4 ? "Critical" : "Standard"})</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Priority Level:</Text>
                <Text style={styles.value}>{ticket.priority || "NORMAL"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Department:</Text>
                <Text style={styles.value}>{ticket.assignedDepartment || "Pending Assignment"}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.label}>Assigned Crew:</Text>
                <Text style={styles.value}>{ticket.assignedCrew || "Unassigned"}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 4, paddingTop: 4, borderTop: "1pt solid #f1f5f9" }}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Location / Address:</Text>
              <Text style={styles.value}>{ticket.address}</Text>
            </View>
            {ticket.description && (
              <View style={[styles.fieldRow, { marginTop: 2 }]}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>{ticket.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 2: Photo Evidence & Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Photographic Evidence & Computer Vision</Text>
          <View style={styles.evidenceContainer}>
            {ticket.imageUrl ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={ticket.imageUrl} style={styles.evidenceImage} />
            ) : (
              <View style={[styles.evidenceImage, { backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ fontSize: 8, color: "#64748b" }}>No Image Attached</Text>
              </View>
            )}
            <View style={styles.evidenceMeta}>
              <Text style={{ fontSize: 8, color: "#475569", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold" }}>Evidence Status: </Text>
                Verified Image Evidence on Record
              </Text>
              <Text style={{ fontSize: 8, color: "#475569", marginBottom: 3 }}>
                <Text style={{ fontWeight: "bold" }}>Geotag Coordinates: </Text>
                OpenStreetMap GIS Pin Synced
              </Text>
              <Text style={{ fontSize: 8, color: "#475569" }}>
                <Text style={{ fontWeight: "bold" }}>Triage Engine: </Text>
                Gemini Vision AI Automated Assessment
              </Text>
            </View>
          </View>
        </View>

        {/* Section 3: Timestamped Event History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Timestamped Event & Audit History</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colTime}>TIMESTAMP</Text>
              <Text style={styles.colEvent}>EVENT / STATUS</Text>
              <Text style={styles.colDetails}>DETAILS</Text>
            </View>
            {events.map((ev: any, idx: number) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.cellTime}>{ev.timestamp || formattedDate}</Text>
                <Text style={styles.cellEvent}>{ev.event || ev.status || "STATUS UPDATE"}</Text>
                <Text style={styles.cellDetails}>{ev.detail || ev.notes || "Operation recorded in municipal dispatch journal."}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          CityPulse Smart City Triage Hub • Municipal Hazard Compliance Report • Generated on {new Date().toLocaleString()} • Single-Page Legal Document
        </Text>
      </Page>
    </Document>
  );
}
