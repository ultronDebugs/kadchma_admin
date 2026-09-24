import type { AuditEntry, AuditFilters, EnrollmentRecord, Filters } from "@/lib/types";

export function filterRecords(records: EnrollmentRecord[], f: Filters) {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
  return records.filter((r) => {
    if (f.name && !(r.first + " " + r.last + " " + (r.other || "")).toLowerCase().includes(f.name.toLowerCase().trim()))
      return false;
    if (f.phone && !norm(r.phone).includes(norm(f.phone))) return false;
    if (f.nin && !norm(r.nin).includes(norm(f.nin))) return false;
    if (f.facility && r.facility !== f.facility) return false;
    if (f.gender && r.gender !== f.gender) return false;
    if (f.marital && r.marital !== f.marital) return false;
    if (f.status && r.status !== f.status) return false;
    if (f.expiry && r.expiry > new Date(f.expiry + "T23:59:59")) return false;
    return true;
  });
}

export function sortRecords(
  records: EnrollmentRecord[],
  key: "name" | "dob" | "status",
  dir: "asc" | "desc",
) {
  const d = dir === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    if (key === "dob") return (a.dob.getTime() - b.dob.getTime()) * d;
    if (key === "status") return a.status.localeCompare(b.status) * d;
    return (a.last + a.first).localeCompare(b.last + b.first) * d;
  });
}

export function hasActiveFilters(f: Filters) {
  return Object.values(f).some((v) => v !== "");
}

export function filterAudit(audit: AuditEntry[], f: AuditFilters) {
  return audit.filter((a) => {
    if (f.admin && a.admin !== f.admin) return false;
    if (f.action && a.action !== f.action) return false;
    if (f.from && a.at < new Date(f.from + "T00:00:00")) return false;
    if (f.to && a.at > new Date(f.to + "T23:59:59")) return false;
    return true;
  });
}

export function historyForEnrollment(audit: AuditEntry[], enrollmentId: string) {
  return audit
    .filter((a) => a.enrollmentId === enrollmentId && a.action === "Status change")
    .sort((a, b) => b.at.getTime() - a.at.getTime());
}
