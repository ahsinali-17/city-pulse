import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 22,
    marginBottom: 5,
    color: "#0f172a",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    color: "#334155",
    fontWeight: "bold",
    borderBottom: "1pt solid #cbd5e1",
    paddingBottom: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryBox: {
    width: "23%",
    padding: 8,
    border: "1pt solid #e2e8f0",
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
  summaryLabel: { fontSize: 8, color: "#64748b", textTransform: "uppercase" },
  summaryValue: { fontSize: 16, color: "#0f172a", fontWeight: "bold", marginTop: 4 },
  
  // Table Styles
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableRowHeader: {
    margin: "auto",
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColHeaderID: { width: "15%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableColHeaderStatus: { width: "20%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableColHeaderTitle: { width: "40%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColID: { width: "15%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableColStatus: { width: "20%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableColTitle: { width: "40%", borderStyle: "solid", borderWidth: 1, borderColor: "#e2e8f0", borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  
  tableCellHeader: { margin: 2, fontSize: 8, fontWeight: "bold", color: "#334155" },
  tableCell: { margin: 2, fontSize: 8, color: "#0f172a" },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 8,
  },
});

const tableColBase = {
  borderStyle: "solid" as const,
  borderWidth: 1,
  borderColor: "#e2e8f0",
  borderLeftWidth: 0,
  borderTopWidth: 0,
  padding: 4,
};

export interface ReportTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  severity: number;
  location: string;
}

export interface ReportData {
  totalTickets: number;
  resolvedTickets: number;
  inProgressTickets: number;
  urgentTickets: number;
  generationDate: string;
  tickets: ReportTicket[];
}

export const ExecutiveReport = ({ data }: { data: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>CityPulse Executive Audit</Text>
      <Text style={styles.subtitle}>Detailed System Compliance & Infrastructure Report • {data.generationDate}</Text>

      {/* Summary KPI Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Total Incidents</Text>
          <Text style={styles.summaryValue}>{data.totalTickets}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Resolved</Text>
          <Text style={styles.summaryValue}>{data.resolvedTickets}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>In Progress</Text>
          <Text style={styles.summaryValue}>{data.inProgressTickets}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Urgent/Critical</Text>
          <Text style={styles.summaryValue}>{data.urgentTickets}</Text>
        </View>
      </View>

      {/* Incident Data Table */}
      <View style={{ marginTop: 10 }}>
        <Text style={styles.title}>Incident Log ({data.tickets.length} records)</Text>
        <View style={styles.table}>
          <View style={styles.tableRowHeader}>
            <View style={styles.tableColHeaderID}><Text style={styles.tableCellHeader}>ID</Text></View>
            <View style={styles.tableColHeaderStatus}><Text style={styles.tableCellHeader}>STATUS</Text></View>
            <View style={{ ...tableColBase, width: "15%" }}><Text style={styles.tableCellHeader}>PRIORITY</Text></View>
            <View style={{ ...tableColBase, width: "30%" }}><Text style={styles.tableCellHeader}>TITLE</Text></View>
            <View style={{ ...tableColBase, width: "25%" }}><Text style={styles.tableCellHeader}>LOCATION</Text></View>
          </View>
          {data.tickets.map((t, i) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColID}><Text style={styles.tableCell}>{t.id.substring(0, 8)}</Text></View>
              <View style={styles.tableColStatus}><Text style={styles.tableCell}>{t.status.replace(/_/g, " ")}</Text></View>
              <View style={{ ...tableColBase, width: "15%" }}><Text style={styles.tableCell}>{t.priority} (Sev {t.severity})</Text></View>
              <View style={{ ...tableColBase, width: "30%" }}><Text style={styles.tableCell}>{t.title}</Text></View>
              <View style={{ ...tableColBase, width: "25%" }}><Text style={styles.tableCell}>{t.location}</Text></View>
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.footer}>
        Generated automatically by CityPulse AI Triage Hub for internal administrative use only.
      </Text>
    </Page>
  </Document>
);
