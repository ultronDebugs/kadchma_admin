import type { EnrollmentRecord, Status } from "@/lib/types";

export const STATUSES: Status[] = ["Active", "Pending", "Expired", "Suspended", "Inactive"];
export const ACTIONS = ["Status change", "Record viewed", "Export generated"] as const;

export function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDT(d: Date) {
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  );
}

export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function daysTo(d: Date) {
  return Math.round((d.getTime() - Date.now()) / 86400000);
}

export function na(v: string | null | undefined) {
  return v && String(v).trim() ? v : "N/A";
}

export function initialsOf(a: string, b: string) {
  return (((a || "?")[0] || "") + ((b || "")[0] || "")).toUpperCase();
}

const STATUS_KEYS: Record<string, string> = {
  Active: "active",
  Pending: "pending",
  Expired: "expired",
  Suspended: "suspended",
  Inactive: "inactive",
};

export function statusTone(s: string) {
  const k = STATUS_KEYS[s] || "inactive";
  return {
    bg: `var(--st-${k}-bg)`,
    fg: `var(--st-${k}-fg)`,
    bd: `var(--st-${k}-bd)`,
  };
}

const AVATAR_KEYS = ["active", "pending", "suspended", "inactive", "expired"];

export function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  const k = AVATAR_KEYS[h % AVATAR_KEYS.length];
  return { bg: `var(--st-${k}-bg)`, fg: `var(--st-${k}-fg)` };
}

export function warnFor(r: Pick<EnrollmentRecord, "expiry">, expiryWarningDays = 60) {
  const days = daysTo(r.expiry);
  if (days < 0) {
    return {
      warn: true,
      warnText: `Enrollment expired ${Math.abs(days)} days ago`,
      warnFg: "var(--st-expired-fg)",
    };
  }
  if (days <= expiryWarningDays) {
    return {
      warn: true,
      warnText: `Expiring soon · ${days} days left`,
      warnFg: "var(--st-pending-fg)",
    };
  }
  return { warn: false, warnText: "", warnFg: "" };
}
