import type { EnrollmentRecord, Status } from "@/lib/types";
import type { StoredEnrollment } from "@/lib/enrollment-repo";

// The WhatsApp bot never collects marital status, disability, or a picture,
// so those fields are labelled rather than guessed.
const STATUS_FROM_STORE: Record<string, Status> = {
  Enrolled: "Active",
  "Pending Payment": "Pending",
  "Pending Review": "Pending",
};

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
    marital: "Not recorded",
    disability: "Not recorded",
    address: doc.address || "",
    phone: doc.phone_number || "",
    facility: doc.facility_of_choice || "",
    hasPicture: false,
    status: STATUS_FROM_STORE[doc.status] ?? "Pending",
    channel: doc.contact_channel || "WhatsApp",
    note: doc.payment_status
      ? `Payment ${doc.payment_status.toLowerCase()}${doc.payment_proof_note ? " — " + doc.payment_proof_note : ""}`
      : "",
    expiry: oneYearAfter(enrolledAt),
    history: [],
  };
}
