"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Share2, Download, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { TicketAuditPdf, type TicketAuditData } from "./ticket-audit-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
        <Loader2 className="size-3.5 animate-spin" /> Preparing PDF...
      </Button>
    ),
  }
);

interface TicketDetailActionsProps {
  ticket: TicketAuditData;
}

export function TicketDetailActions({ ticket }: TicketDetailActionsProps) {
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleShare = async () => {
    // Format: "📍 CityPulse Hazard #HAZ-41127 (Pothole on 452 Elm Street) — Status: DISPATCHED"
    const issueName = ticket.title || ticket.category;
    const summary = `📍 CityPulse Hazard #${ticket.id} (${issueName} on ${ticket.address}) — Status: ${ticket.status}`;

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setCopied(true);
      toast.success("Ticket summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      toast.error("Failed to copy summary to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2 self-start sm:self-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="text-xs gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Share2 className="size-3.5" />
        )}
        <span>{copied ? "Copied!" : "Share"}</span>
      </Button>

      {isClient ? (
        <PDFDownloadLink
          document={<TicketAuditPdf ticket={ticket} />}
          fileName={`CityPulse_Audit_${ticket.id}.pdf`}
        >
          {({ loading }) => (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              className="text-xs gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  <span>Audit PDF</span>
                </>
              )}
            </Button>
          )}
        </PDFDownloadLink>
      ) : (
        <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
          <Download className="size-3.5" /> Audit PDF
        </Button>
      )}
    </div>
  );
}
