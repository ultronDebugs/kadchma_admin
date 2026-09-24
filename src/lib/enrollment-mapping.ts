import type { EnrollmentRecord, Status } from "@/lib/types";
import type { StoredEnrollment } from "@/lib/enrollment-repo";

const DASHBOARD_STATUSES: Status[] = ["Active", "Pending", "Expired", "Suspended", "Inactive"];

// The bot speaks its own enrollment vocabulary ("Enrolled", "Pending
// Payment", "Pending Review"); storage always holds the dashboard's
// vocabulary so a later staff-driven status change and this mapping never
// disagree on what a stored value means.
const STATUS_FROM_BOT: Record<string, Status> = {
  Enrolled: "Active",
  "Pending Payment": "Pending",
  "Pending Review": "Pending",
};

/** Normalizes any incoming status (bot vocabulary or dashboard vocabulary) to the dashboard's Status — call this at every write. */
export function normalizeIncomingStatus(value: string): Status {
  if (DASHBOARD_STATUSES.includes(value as Status)) return value as Status;
  return STATUS_FROM_BOT[value] ?? "Pending";
}

function parseDdMmYyyy(value: string): Date {
  const [d, m, y] = value.split("/").map(Number);
  if (!d || !m || !y) return new Date(NaN);
  return new Date(y, m - 1, d);
}

function oneYearAfter(date: Date): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

export function toEnrollmentRecord(doc: StoredEnrollment): EnrollmentRecord {
  const enrolledAt = new Date(doc.enrolled_at || Date.now());
  return {
    id: doc.enrollment_id,
    first: doc.first_name || "",
    last: doc.last_name || "",
    other: doc.other_name || "",
    nin: doc.NIN || "",
    dob: parseDdMmYyyy(doc.date_of_birth || ""),
    gender: doc.gender === "Female" ? "Female" : "Male",
    // The WhatsApp bot never collects marital status, disability, or a
    // picture, so those fields are labelled rather than guessed.
    marital: "Not recorded",
    disability: "Not recorded",
    address: doc.address || "",
    phone: doc.phone_number || "",
    facility: doc.facility_of_choice || "",
    hasPicture: false,
    status: DASHBOARD_STATUSES.includes(doc.status as Status) ? (doc.status as Status) : "Pending",
    channel: doc.contact_channel || "WhatsApp",
    note: doc.payment_status
      ? `Payment ${doc.payment_status.toLowerCase()}${doc.payment_proof_note ? " — " + doc.payment_proof_note : ""}`
      : "",
    expiry: oneYearAfter(enrolledAt),
  };
}
