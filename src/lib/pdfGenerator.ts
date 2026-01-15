import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Tables } from "@/integrations/supabase/types";

type RefundClaim = Tables<"refund_claims">;

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    risk_assessment: "Risk Assessment",
    officer_review: "Officer Review",
    supervisor_approval: "Supervisor Approval",
    approved: "Approved",
    rejected: "Rejected",
    payment_processing: "Payment Processing",
    paid: "Paid",
  };
  return labels[status] || status;
};

export const generateClaimPDF = async (claim: RefundClaim) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header with Ethiopian colors stripe
  doc.setFillColor(0, 128, 55); // Ethiopian Green
  doc.rect(0, 0, pageWidth / 3, 8, "F");
  doc.setFillColor(252, 209, 22); // Ethiopian Yellow
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 8, "F");
  doc.setFillColor(218, 41, 28); // Ethiopian Red
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 8, "F");

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("VAT REFUND CLAIM STATEMENT", pageWidth / 2, 25, { align: "center" });

  // Subtitle
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Ministry of Revenues - Federal Democratic Republic of Ethiopia", pageWidth / 2, 33, { align: "center" });

  // Tracking Code Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 42, pageWidth - 28, 20, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("TRACKING CODE", 20, 50);
  doc.setFontSize(16);
  doc.setFont("courier", "bold");
  doc.setTextColor(0, 128, 55);
  doc.text(claim.claim_number, 20, 58);

  // Status Badge
  const statusLabel = getStatusLabel(claim.status);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  let statusColor: [number, number, number] = [100, 116, 139];
  if (claim.status === "approved" || claim.status === "paid") {
    statusColor = [0, 128, 55];
  } else if (claim.status === "rejected") {
    statusColor = [218, 41, 28];
  }
  
  doc.setTextColor(...statusColor);
  doc.text(`Status: ${statusLabel.toUpperCase()}`, pageWidth - 20, 52, { align: "right" });

  // Claim Details Table
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Claim Details", 14, 75);

  autoTable(doc, {
    startY: 80,
    head: [],
    body: [
      ["Claim Amount", `ETB ${Number(claim.claim_amount).toLocaleString("en-ET", { minimumFractionDigits: 2 })}`],
      ["VAT Period", claim.vat_period],
      ["Currency", claim.currency || "ETB"],
      ["Submission Date", new Date(claim.submitted_at || claim.created_at).toLocaleDateString("en-GB", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })],
      ["Last Updated", new Date(claim.updated_at).toLocaleDateString("en-GB", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      })],
    ],
    theme: "striped",
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: "auto" },
    },
    headStyles: {
      fillColor: [0, 128, 55],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Bank Details (if available)
  if (claim.bank_name || claim.bank_account_number) {
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Bank Details", 14, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [],
      body: [
        ["Bank Name", claim.bank_name || "Not specified"],
        ["Account Number", claim.bank_account_number ? `****${claim.bank_account_number.slice(-4)}` : "Not specified"],
      ],
      theme: "striped",
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { cellWidth: "auto" },
      },
    });
  }

  // Description (if available)
  if (claim.description) {
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Description", 14, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    
    const splitDescription = doc.splitTextToSize(claim.description, pageWidth - 28);
    doc.text(splitDescription, 14, currentY + 8);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY - 5, pageWidth, 35, "F");
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    "This document is an official claim statement from the Ethiopian Ministry of Revenues VAT Refund System.",
    pageWidth / 2,
    footerY + 3,
    { align: "center" }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString("en-GB")}`,
    pageWidth / 2,
    footerY + 10,
    { align: "center" }
  );
  doc.text(
    "For inquiries, contact: support@mor.gov.et | +251 11 551 7788",
    pageWidth / 2,
    footerY + 17,
    { align: "center" }
  );

  // Save the PDF
  doc.save(`Claim-${claim.claim_number}.pdf`);
};

export const generateTrackingCodePDF = async (claimNumber: string, submittedDate: string) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [100, 60],
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Ethiopian stripe at top
  doc.setFillColor(0, 128, 55);
  doc.rect(0, 0, pageWidth / 3, 3, "F");
  doc.setFillColor(252, 209, 22);
  doc.rect(pageWidth / 3, 0, pageWidth / 3, 3, "F");
  doc.setFillColor(218, 41, 28);
  doc.rect((pageWidth / 3) * 2, 0, pageWidth / 3, 3, "F");

  // Title
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("VAT REFUND TRACKING CODE", pageWidth / 2, 12, { align: "center" });

  // Tracking Code
  doc.setFontSize(14);
  doc.setFont("courier", "bold");
  doc.setTextColor(0, 128, 55);
  doc.text(claimNumber, pageWidth / 2, 28, { align: "center" });

  // Submitted Date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Submitted: ${submittedDate}`, pageWidth / 2, 38, { align: "center" });

  // Footer
  doc.setFontSize(6);
  doc.text("Keep this code for tracking your claim", pageWidth / 2, 50, { align: "center" });
  doc.text("Ministry of Revenues, Ethiopia", pageWidth / 2, 55, { align: "center" });

  doc.save(`TrackingCode-${claimNumber}.pdf`);
};
