import type { AuditEntry, EnrollmentRecord, StaffUser, Status } from "@/lib/types";

// Fixed reference date the prototype was authored against — keeps every
// expiry countdown and "days ago" figure reproducible across renders.
export const TODAY = new Date(2026, 8, 5);

const FIRST = [
  "Aisha", "Nasir", "Hauwa", "Musa", "Zainab", "Ibrahim", "Fatima", "Sani", "Amina", "Yusuf",
  "Halima", "Bashir", "Maryam", "Suleiman", "Rukayya", "Kabiru", "Jamila", "Danladi", "Safiya",
  "Umar", "Bilkisu", "Auwal", "Hadiza", "Shehu", "Garba", "Mustapha", "Binta", "Salisu", "Larai", "Adamu",
];
const LAST = [
  "Bello", "Yakubu", "Sani", "Musa", "Danjuma", "Aliyu", "Ibrahim", "Lawal", "Abubakar", "Gambo",
  "Dauda", "Usman", "Tanko", "Maigari", "Yahaya", "Bala", "Zubairu", "Hassan", "Idris", "Shehu",
];
const OTHER = ["", "Nafisa", "Abdulkarim", "", "Zubaida", "", "Mukhtar", "Rabi", "", "Halilu"];
const FACILITIES = [
  "Barau Dikko Teaching Hospital, Kaduna",
  "Yusuf Dantsoho Memorial Hospital, Tudun Wada",
  "General Hospital Zaria",
  "Gambo Sawaba General Hospital, Zaria",
  "PHC Kabala Doki, Kaduna South",
  "PHC Rigasa, Igabi",
  "General Hospital Kachia",
  "Kafanchan General Hospital, Jema'a",
  "PHC Chikun Central",
  "PHC Sabon Gari",
];
const LGAS = ["Kaduna North", "Kaduna South", "Chikun", "Zaria", "Sabon Gari", "Kachia", "Jema'a", "Igabi"];
const STREETS = [
  "Ahmadu Bello Way", "Constitution Road", "Yakubu Gowon Way", "Kachia Road", "Sokoto Road",
  "Rabah Road", "Independence Way", "Ungwan Rimi Layout", "Sabon Tasha Junction", "Tudun Wada Market Road",
];
const MARITAL = ["Single", "Married", "Divorced", "Widowed"];
const DISABILITY = ["None", "None", "None", "Visual impairment", "Hearing impairment", "Physical impairment"];
const CHANNELS = ["SMS", "Phone call", "WhatsApp", "USSD", "In-person"];
export const STATUSES: Status[] = ["Active", "Pending", "Expired", "Suspended", "Inactive"];
export const ADMINS = ["Hadiza Aliyu", "Nuhu Garba", "Rabi Suleiman", "Ibrahim Dogo", "Zainab Tanko"];
export const ACTIONS = ["Status change", "Record viewed", "Export generated"] as const;
const NOTES = [
  "Enrollee registered at an LGA outreach desk; premium receipt sighted.",
  "Awaiting biometric capture at the assigned facility.",
  "",
  "Household of five; dependants enrolled under a separate record.",
  "Renewal reminder sent by SMS twice; no response yet.",
  "",
  "Suspended pending verification of residency documents.",
];

// Linear congruential generator, ported verbatim (including its float
// precision quirks) so the same seed reproduces the exact same records.
class Rng {
  private seed = 20260905;
  next() {
    this.seed = (this.seed * 1103515245 + 12345) % 2147483648;
    return this.seed / 2147483648;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

function addDays(n: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return d;
}

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
  return Math.round((d.getTime() - TODAY.getTime()) / 86400000);
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
  Invited: "pending",
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

function buildRecords(): EnrollmentRecord[] {
  const rng = new Rng();
  const out: EnrollmentRecord[] = [];
  for (let i = 0; i < 42; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7 + 3) % LAST.length];
    const offsets = [-420, -90, -18, 12, 34, 52, 58, 121, 190, 260, 330, 410, 505, 620];
    const off = offsets[Math.floor(rng.next() * offsets.length)];
    const expiry = addDays(off);
    let status: Status;
    if (off < 0) {
      status = rng.next() < 0.8 ? "Expired" : "Suspended";
    } else {
      const r = rng.next();
      status = r < 0.62 ? "Active" : r < 0.78 ? "Pending" : r < 0.9 ? "Suspended" : "Inactive";
    }
    const dob = new Date(
      1958 + Math.floor(rng.next() * 44),
      Math.floor(rng.next() * 12),
      1 + Math.floor(rng.next() * 27),
    );
    const hist: EnrollmentRecord["history"] = [];
    const hcount = Math.floor(rng.next() * 3);
    let prev: Status = "Pending";
    for (let h = 0; h < hcount; h++) {
      const to = h === hcount - 1 ? status : rng.pick(STATUSES);
      hist.push({
        from: prev,
        to,
        admin: rng.pick(ADMINS),
        at: addDays(-(20 + h * 37 + Math.floor(rng.next() * 20))),
      });
      prev = to;
    }
    out.push({
      id: "KD-INF-" + String(10240 + i * 7),
      first,
      last,
      other: rng.pick(OTHER),
      nin: "0000 " + String(1000 + i * 13) + " 00" + (i % 10),
      dob,
      gender: i % 2 === 0 ? "Female" : "Male",
      marital: rng.pick(MARITAL),
      disability: rng.pick(DISABILITY),
      address:
        "No. " + (3 + Math.floor(rng.next() * 180)) + ", " + rng.pick(STREETS) + ", " + rng.pick(LGAS) + " LGA, Kaduna State",
      phone: "0800 " + String(100 + (i % 9) * 11) + " " + String(1000 + i * 21),
      facility: rng.pick(FACILITIES),
      hasPicture: rng.next() < 0.72,
      status,
      channel: rng.pick(CHANNELS),
      note: rng.pick(NOTES),
      expiry,
      history: hist.reverse(),
    });
  }
  return out;
}

function buildAudit(): AuditEntry[] {
  const rng = new Rng();
  const out: AuditEntry[] = [];
  for (let i = 0; i < 26; i++) {
    const action = rng.next() < 0.72 ? "Status change" : rng.pick(ACTIONS as unknown as string[]);
    const from = rng.pick(STATUSES);
    let to = rng.pick(STATUSES);
    if (to === from) to = from === "Active" ? "Suspended" : "Active";
    out.push({
      at: addDays(-Math.floor(rng.next() * 45)),
      admin: rng.pick(ADMINS),
      action: action as AuditEntry["action"],
      enrollee: FIRST[(i * 5 + 2) % FIRST.length] + " " + LAST[(i * 3 + 1) % LAST.length],
      from: action === "Status change" ? from : null,
      to: action === "Status change" ? to : null,
    });
  }
  return out.sort((a, b) => b.at.getTime() - a.at.getTime());
}

function buildUsers(): StaffUser[] {
  const roles = ["Enrollment Officer", "Facility Supervisor", "Zonal Coordinator", "System Administrator"];
  const names = [
    "Hadiza Aliyu", "Nuhu Garba", "Rabi Suleiman", "Ibrahim Dogo", "Zainab Tanko",
    "Salisu Maigari", "Jamila Bello", "Auwal Yahaya",
  ];
  return names.map((n, i) => ({
    name: n,
    email: n.toLowerCase().replace(/'/g, "").replace(/ /g, ".") + "@kadchma.kd.gov.ng",
    role: roles[i % roles.length],
    scope: i % 3 === 0 ? LGAS[i % LGAS.length] + " LGA" : FACILITIES[i % FACILITIES.length],
    lastActive: i === 0 ? "Today, 09:14" : i < 4 ? fmtDT(addDays(-i)) : fmtDT(addDays(-(i * 6))),
    account: i === 5 ? "Suspended" : i === 7 ? "Invited" : "Active",
  }));
}

export { FACILITIES, LGAS };

export function seedDatabase() {
  return {
    records: buildRecords(),
    audit: buildAudit(),
    users: buildUsers(),
  };
}
