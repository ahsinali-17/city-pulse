"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Download, FileText, Ban } from "lucide-react";
import { ExecutiveReport, type ReportData } from "./pdf-report";
import { useEffect, useState } from "react";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled className="w-full sm:w-auto">
        <Download className="mr-2 size-4 animate-pulse" /> Loading Exporter...
      </Button>
    ),
  }
);

export function PdfDownloadButton({
  data,
  disabled = false,
}: {
  data: ReportData;
  disabled?: boolean;
}) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return (
      <Button disabled className="w-full sm:w-auto">
        <FileText className="mr-2 size-4" /> Preparing Document...
      </Button>
    );
  }

  if (disabled) {
    return (
      <Button disabled className="w-full sm:w-auto opacity-50">
        <Ban className="mr-2 size-4" /> No Matching Data
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ExecutiveReport data={data} />}
      fileName={`citypulse_compliance_${new Date().toISOString().split("T")[0]}.pdf`}
    >
      {({ loading }) =>
        loading ? (
          <Button disabled className="w-full sm:w-auto">
            <Download className="mr-2 size-4 animate-pulse" /> Generating PDF...
          </Button>
        ) : (
          <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer">
            <FileText className="mr-2 size-4" /> Download PDF Report
          </Button>
        )
      }
    </PDFDownloadLink>
  );
}
