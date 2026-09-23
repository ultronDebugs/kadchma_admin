"use client";

import { create } from "zustand";
import { ADMINS, fmt, seedDatabase } from "@/lib/mock-data";
import type {
  AuditFilters,
  DataState,
  DrawerState,
  EnrollmentRecord,
  Filters,
  PendingConfirm,
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

const seed = seedDatabase();

type AppState = {
  records: EnrollmentRecord[];
  audit: ReturnType<typeof seedDatabase>["audit"];
  users: ReturnType<typeof seedDatabase>["users"];

  expiryWarningDays: number;

  // dev-panel simulated data states
  dataState: DataState;
  failNext: boolean;
  setDataState: (s: DataState) => void;
  toggleFailNext: () => void;

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
  openInvite: () => void;
  openEditRole: (name: string) => void;
  openDeactivate: (name: string, reactivate: boolean) => void;
  closeUserDialog: () => void;
  confirmUserDialog: () => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  retryToast: (id: string, payload: PendingConfirm) => void;

  exportCsv: (rows: EnrollmentRecord[]) => void;

  hydrateFromLive: () => Promise<void>;
};

function reviveRecordDates(r: EnrollmentRecord): EnrollmentRecord {
  return {
    ...r,
    dob: new Date(r.dob),
    expiry: new Date(r.expiry),
    history: r.history.map((h) => ({ ...h, at: new Date(h.at) })),
  };
}

function updateEnrollmentStatus(failNext: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failNext) reject(new Error("Gateway timeout while contacting the enrollment service"));
      else resolve();
    }, 1100);
  });
}

let toastSeq = 0;

export const useAppStore = create<AppState>((set, get) => ({
  records: seed.records,
  audit: seed.audit,
  users: seed.users,

  expiryWarningDays: 60,

  dataState: "ready",
  failNext: false,
  setDataState: (s) =>
    set({ dataState: s, pageNo: 1, selectedId: null, drawerState: s === "error" ? "error" : "idle" }),
  toggleFailNext: () => set((st) => ({ failNext: !st.failNext })),

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
    set({ selectedId: id, drawerState: "loading", draftStatus: null });
    setTimeout(() => {
      const st = get();
      if (st.selectedId !== id) return;
      const rec = st.records.find((r) => r.id === id);
      set({
        drawerState: st.dataState === "error" ? "error" : "ready",
        draftStatus: rec ? rec.status : null,
      });
    }, 520);
  },
  closeDrawer: () => set({ selectedId: null, draftStatus: null, confirm: null }),
  retryDrawer: () => {
    const id = get().selectedId;
    set({ dataState: get().dataState === "error" ? "ready" : get().dataState });
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
      await updateEnrollmentStatus(get().failNext);
      const at = new Date();
      set((st) => ({
        saving: false,
        confirm: null,
        draftStatus: c.to,
        records: st.records.map((r) =>
          r.id === c.id
            ? { ...r, status: c.to, history: [{ from: c.from, to: c.to, admin: "Hadiza Aliyu", at }, ...r.history] }
            : r,
        ),
        audit: [
          { at, admin: "Hadiza Aliyu", action: "Status change", enrollee: c.name, from: c.from, to: c.to },
          ...st.audit,
        ],
      }));
      get().pushToast({
        kind: "ok",
        title: "Enrollment status updated",
        body: `${c.name} is now ${c.to}. The change is recorded in the audit log.`,
      });
    } catch (err) {
      const rec = get().records.find((r) => r.id === c.id);
      set({ saving: false, confirm: null, draftStatus: rec ? rec.status : null, failNext: false });
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
  openInvite: () => set({ userDialog: { kind: "invite" } }),
  openEditRole: (name) => set({ userDialog: { kind: "role", name } }),
  openDeactivate: (name, reactivate) => set({ userDialog: { kind: "deactivate", name, reactivate } }),
  closeUserDialog: () => set({ userDialog: null }),
  confirmUserDialog: () => {
    const ud = get().userDialog;
    if (!ud) return;
    const title =
      ud.kind === "invite" ? "User registered" : ud.kind === "role" ? "Role updated" : "Account updated";
    set({ userDialog: null });
    get().pushToast({
      kind: "ok",
      title,
      body: "Interface demonstration only — no account changes are saved in this prototype.",
    });
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
        r.id, r.first, r.last, r.other || "N/A", r.nin, fmt(r.dob), r.gender, r.marital,
        r.disability, r.address, r.phone, r.facility, r.status, r.channel, r.note || "N/A", fmt(r.expiry),
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

  hydrateFromLive: async () => {
    try {
      const res = await fetch("/api/enrollments");
      const json = (await res.json()) as { configured: boolean; records: EnrollmentRecord[] };
      if (json.configured && json.records.length > 0) {
        set({ records: json.records.map(reviveRecordDates) });
      }
    } catch {
      // No live source configured or reachable — keep the demo data.
    }
  },
}));

export { ADMINS };
