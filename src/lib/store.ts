"use client";

import { create } from "zustand";
import { toEnrollmentRecord } from "@/lib/enrollment-mapping";
import type {
  AuditEntry,
  AuditFilters,
  DrawerState,
  EnrollmentRecord,
  Filters,
  PendingConfirm,
  StaffUser,
  Status,
  Toast,
  UserDialogState,
} from "@/lib/types";

const EMPTY_FILTERS: Filters = {
  name: "",
  phone: "",
  nin: "",
  facility: "",
  gender: "",
  marital: "",
  status: "",
  expiry: "",
};

const EMPTY_AUDIT_FILTERS: AuditFilters = { admin: "", action: "", from: "", to: "" };

type FetchStatus = "idle" | "loading" | "ready" | "empty" | "error";

async function getJson(url: string) {
  const res = await fetch(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request to ${url} failed`);
  return json;
}

async function sendJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request to ${url} failed`);
  return json;
}

type AppState = {
  records: EnrollmentRecord[];
  recordsStatus: FetchStatus;
  hydrateRecords: () => Promise<void>;

  audit: AuditEntry[];
  auditStatus: FetchStatus;
  hydrateAudit: () => Promise<void>;

  users: StaffUser[];
  usersStatus: FetchStatus;
  hydrateUsers: () => Promise<void>;

  expiryWarningDays: number;

  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;

  sortKey: "name" | "dob" | "status";
  sortDir: "asc" | "desc";
  sortBy: (key: "name" | "dob" | "status") => void;

  pageNo: number;
  perPage: number;
  setPageNo: (n: number) => void;
  setPerPage: (n: number) => void;

  selectedId: string | null;
  drawerState: DrawerState;
  draftStatus: Status | null;
  openRecord: (id: string) => void;
  closeDrawer: () => void;
  retryDrawer: () => void;

  confirm: PendingConfirm | null;
  saving: boolean;
  pickStatus: (to: Status) => void;
  cancelConfirm: () => void;
  commitStatus: () => Promise<void>;

  auditFilters: AuditFilters;
  setAuditFilter: <K extends keyof AuditFilters>(key: K, value: AuditFilters[K]) => void;
  resetAuditFilters: () => void;

  userDialog: UserDialogState | null;
  userDialogSubmitting: boolean;
  openInvite: () => void;
  openEditRole: (email: string, name: string, role: string) => void;
  openDeactivate: (email: string, name: string, reactivate: boolean) => void;
  closeUserDialog: () => void;
  registerUser: (payload: { name: string; email: string; password: string; role: string; scope: string }) => Promise<boolean>;
  changeUserRole: (email: string, role: string) => Promise<boolean>;
  setUserAccount: (email: string, account: "Active" | "Suspended") => Promise<boolean>;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  retryToast: (id: string, payload: PendingConfirm) => void;

  exportCsv: (rows: EnrollmentRecord[]) => void;
};

let toastSeq = 0;

export const useAppStore = create<AppState>((set, get) => ({
  records: [],
  recordsStatus: "idle",
  hydrateRecords: async () => {
    set({ recordsStatus: "loading" });
    try {
      const json = await getJson("/api/enrollments");
      const records: EnrollmentRecord[] = (json.records ?? []).map(
        (r: EnrollmentRecord) => ({ ...r, dob: new Date(r.dob), expiry: new Date(r.expiry) }),
      );
      set({ records, recordsStatus: records.length === 0 ? "empty" : "ready" });
    } catch {
      set({ recordsStatus: "error" });
    }
  },

  audit: [],
  auditStatus: "idle",
  hydrateAudit: async () => {
    set({ auditStatus: "loading" });
    try {
      const json = await getJson("/api/audit");
      const audit: AuditEntry[] = (json.entries ?? []).map((a: AuditEntry) => ({ ...a, at: new Date(a.at) }));
      set({ audit, auditStatus: audit.length === 0 ? "empty" : "ready" });
    } catch {
      set({ auditStatus: "error" });
    }
  },

  users: [],
  usersStatus: "idle",
  hydrateUsers: async () => {
    set({ usersStatus: "loading" });
    try {
      const json = await getJson("/api/users");
      type ApiUser = { name: string; email: string; role: string; scope: string; account: "Active" | "Suspended"; lastActiveAt: string | null };
      const users: StaffUser[] = (json.users ?? []).map((u: ApiUser) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        scope: u.scope,
        account: u.account,
        lastActive: u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString("en-GB") : "Never signed in",
      }));
      set({ users, usersStatus: users.length === 0 ? "empty" : "ready" });
    } catch {
      set({ usersStatus: "error" });
    }
  },

  expiryWarningDays: 60,

  filters: EMPTY_FILTERS,
  setFilter: (key, value) =>
    set((st) => ({ filters: { ...st.filters, [key]: value }, pageNo: 1 })),
  resetFilters: () => set({ filters: EMPTY_FILTERS, pageNo: 1 }),

  sortKey: "name",
  sortDir: "asc",
  sortBy: (key) =>
    set((st) => ({
      sortKey: key,
      sortDir: st.sortKey === key && st.sortDir === "asc" ? "desc" : "asc",
      pageNo: 1,
    })),

  pageNo: 1,
  perPage: 10,
  setPageNo: (n) => set({ pageNo: n }),
  setPerPage: (n) => set({ perPage: n, pageNo: 1 }),

  selectedId: null,
  drawerState: "idle",
  draftStatus: null,
  openRecord: (id) => {
    const rec = get().records.find((r) => r.id === id);
    set({ selectedId: id, drawerState: rec ? "ready" : "error", draftStatus: rec ? rec.status : null });
  },
  closeDrawer: () => set({ selectedId: null, draftStatus: null, confirm: null }),
  retryDrawer: () => {
    const id = get().selectedId;
    if (id) get().openRecord(id);
  },

  confirm: null,
  saving: false,
  pickStatus: (to) => {
    const st = get();
    const rec = st.records.find((r) => r.id === st.selectedId);
    if (!rec || to === rec.status) {
      set({ draftStatus: to });
      return;
    }
    set({
      draftStatus: to,
      confirm: { id: rec.id, name: rec.first + " " + rec.last, from: rec.status, to },
    });
  },
  cancelConfirm: () => {
    if (get().saving) return;
    const rec = get().records.find((r) => r.id === get().selectedId);
    set({ confirm: null, draftStatus: rec ? rec.status : null });
  },
  commitStatus: async () => {
    const c = get().confirm;
    if (!c || get().saving) return;
    set({ saving: true });
    try {
      const updated = await sendJson(`/api/enrollments/${encodeURIComponent(c.id)}/status`, "PATCH", { status: c.to });
      const record = toEnrollmentRecord(updated);
      set((st) => ({
        saving: false,
        confirm: null,
        draftStatus: record.status,
        records: st.records.map((r) => (r.id === c.id ? record : r)),
      }));
      get().pushToast({
        kind: "ok",
        title: "Enrollment status updated",
        body: `${c.name} is now ${c.to}. The change is recorded in the audit log.`,
      });
      get().hydrateAudit();
    } catch (err) {
      const rec = get().records.find((r) => r.id === c.id);
      set({ saving: false, confirm: null, draftStatus: rec ? rec.status : null });
      get().pushToast({
        kind: "err",
        title: "Status update failed",
        body: `${(err as Error).message}. The status was reverted to ${c.from}.`,
        canRetry: true,
        retryPayload: c,
      });
    }
  },

  auditFilters: EMPTY_AUDIT_FILTERS,
  setAuditFilter: (key, value) =>
    set((st) => ({ auditFilters: { ...st.auditFilters, [key]: value } })),
  resetAuditFilters: () => set({ auditFilters: EMPTY_AUDIT_FILTERS }),

  userDialog: null,
  userDialogSubmitting: false,
  openInvite: () => set({ userDialog: { kind: "invite" } }),
  openEditRole: (email, name, role) => set({ userDialog: { kind: "role", email, name, role } }),
  openDeactivate: (email, name, reactivate) => set({ userDialog: { kind: "deactivate", email, name, reactivate } }),
  closeUserDialog: () => set({ userDialog: null }),
  registerUser: async (payload) => {
    set({ userDialogSubmitting: true });
    try {
      await sendJson("/api/users", "POST", payload);
      set({ userDialog: null, userDialogSubmitting: false });
      get().pushToast({ kind: "ok", title: "User registered", body: `${payload.name} can now sign in with ${payload.email}.` });
      get().hydrateUsers();
      return true;
    } catch (err) {
      set({ userDialogSubmitting: false });
      get().pushToast({ kind: "err", title: "Registration failed", body: (err as Error).message });
      return false;
    }
  },
  changeUserRole: async (email, role) => {
    set({ userDialogSubmitting: true });
    try {
      await sendJson(`/api/users/${encodeURIComponent(email)}`, "PATCH", { role });
      set({ userDialog: null, userDialogSubmitting: false });
      get().pushToast({ kind: "ok", title: "Role updated", body: `${email} is now ${role}.` });
      get().hydrateUsers();
      return true;
    } catch (err) {
      set({ userDialogSubmitting: false });
      get().pushToast({ kind: "err", title: "Role update failed", body: (err as Error).message });
      return false;
    }
  },
  setUserAccount: async (email, account) => {
    set({ userDialogSubmitting: true });
    try {
      await sendJson(`/api/users/${encodeURIComponent(email)}`, "PATCH", { account });
      set({ userDialog: null, userDialogSubmitting: false });
      get().pushToast({
        kind: "ok",
        title: account === "Active" ? "Account reactivated" : "Account deactivated",
        body: `${email} ${account === "Active" ? "can sign in again." : "no longer has access."}`,
      });
      get().hydrateUsers();
      return true;
    } catch (err) {
      set({ userDialogSubmitting: false });
      get().pushToast({ kind: "err", title: "Account update failed", body: (err as Error).message });
      return false;
    }
  },

  toasts: [],
  pushToast: (t) => {
    const id = "t" + Date.now() + "-" + toastSeq++;
    set((st) => ({ toasts: [...st.toasts, { id, ...t }] }));
    if (!t.canRetry) {
      setTimeout(() => get().dismissToast(id), 5200);
    }
  },
  dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),
  retryToast: (id, payload) => {
    get().dismissToast(id);
    set({ confirm: payload, draftStatus: payload.to });
  },

  exportCsv: (rows) => {
    const head = [
      "Enrollment ID", "Firstname", "Surname", "OtherNames", "NIN", "Date of Birth", "Gender",
      "Marital Status", "Disability", "Residential Address", "Phone Number", "Facility",
      "Enrollment Status", "Contact Channel", "Note", "Enrollment Expiry Date",
    ];
    const esc = (v: unknown) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const body = rows.map((r) =>
      [
        r.id, r.first, r.last, r.other || "N/A", r.nin, fmtDate(r.dob), r.gender, r.marital,
        r.disability, r.address, r.phone, r.facility, r.status, r.channel, r.note || "N/A", fmtDate(r.expiry),
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob([[head.map(esc).join(","), ...body].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kadchma-informal-enrollment.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    get().pushToast({ kind: "ok", title: "Export ready", body: `${rows.length} filtered records exported to CSV.` });
  },
}));

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
