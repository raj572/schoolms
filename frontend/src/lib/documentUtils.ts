import { API_BASE_URL } from "./axios";

export type DocumentType =
  | "fee-receipt"
  | "admission-receipt"
  | "marksheet"
  | "admit-card"
  | "transfer-certificate"
  | "id-card"
  | "bonafide-certificate";

export interface DocumentMeta {
  type: DocumentType;
  title: string;
  category: "Finance" | "Academic" | "Certificates" | "Identity";
  description: string;
  badge: string;
  icon: string;
}

export const OFFICIAL_DOCUMENTS: DocumentMeta[] = [
  {
    type: "fee-receipt",
    title: "Fee Receipt",
    category: "Finance",
    description: "Official student fee payment voucher with detailed head-wise breakdown, concessions, and transaction receipt number.",
    badge: "Official Receipt",
    icon: "Receipt",
  },
  {
    type: "admission-receipt",
    title: "Admission Receipt",
    category: "Finance",
    description: "New enrollment & registration fee confirmation voucher with student bio, admission number, and fee terms.",
    badge: "Enrollment",
    icon: "FileCheck",
  },
  {
    type: "marksheet",
    title: "Academic Marksheet",
    category: "Academic",
    description: "Annual & term-wise achievement report card with subject marks, percentage, CGPA, grades, and teacher remarks.",
    badge: "Report Card",
    icon: "GraduationCap",
  },
  {
    type: "admit-card",
    title: "Exam Admit Card",
    category: "Academic",
    description: "Official hall ticket for examination entry with timetable schedule, room allocation, and student photograph.",
    badge: "Hall Ticket",
    icon: "ClipboardCheck",
  },
  {
    type: "transfer-certificate",
    title: "Transfer Certificate (TC)",
    category: "Certificates",
    description: "Statutory school leaving certificate with student record, conduct verification, dues clearance, and authorized seal.",
    badge: "Statutory",
    icon: "FileText",
  },
  {
    type: "id-card",
    title: "Student ID Card",
    category: "Identity",
    description: "Standard vertical CR-80 student identity badge with school branding, photo, barcode, and emergency contact details.",
    badge: "CR-80 Badge",
    icon: "CreditCard",
  },
  {
    type: "bonafide-certificate",
    title: "Bonafide Certificate",
    category: "Certificates",
    description: "Formal institutional bonafide & character letterhead certificate for passport, visa, or academic verification purposes.",
    badge: "Verification",
    icon: "Award",
  },
];

/**
 * Build URL to access a school document.
 */
export const getDocumentUrl = (
  type: DocumentType,
  id?: string | number | null,
  isDownload: boolean = false
): string => {
  const cleanId = id !== undefined && id !== null && String(id).trim() !== "" ? `/${id}` : "";
  const query = isDownload ? "?download=pdf" : "";
  return `${API_BASE_URL}/documents/${type}${cleanId}${query}`;
};

/**
 * Open document in new tab or trigger PDF download.
 */
export const openDocument = (
  type: DocumentType,
  id?: string | number | null,
  isDownload: boolean = false
): void => {
  const url = getDocumentUrl(type, id, isDownload);
  window.open(url, "_blank", "noopener,noreferrer");
};
