export type Status = "Active" | "Pending" | "Expired" | "Suspended" | "Inactive";

export type EnrollmentRecord = {
  id: string;
  first: string;
  last: string;
  other: string;
  nin: string;
  dob: Date;
  gender: "Female" | "Male";
  marital: string;
  disability: string;
  address: string;
  phone: string;
  facility: string;
  hasPicture: boolean;
  status: Status;
  channel: string;
  note: string;
  expiry: Date;
};

export type AuditAction = "Status change" | "Record viewed" | "Export generated";

export type AuditEntry = {
  at: Date;
  admin: string;
  action: AuditAction;
  enrollee: string;
  enrollmentId: string;
  from: Status | null;
  to: Status | null;
};

export type AccountState = "Active" | "Suspended";

export type StaffUser = {
  name: string;
  email: string;
  role: string;
  scope: string;
  lastActive: string;
  account: AccountState;
};

export type SessionUser = { email: string; name: string; role: string };

export type Filters = {
  name: string;
  phone: string;
  nin: string;
  facility: string;
  gender: string;
  marital: string;
  status: string;
  expiry: string;
};

export type AuditFilters = {
  admin: string;
  action: string;
  from: string;
  to: string;
};

export type DataState = "ready" | "loading" | "empty" | "error";

export type DrawerState = "idle" | "loading" | "ready" | "error";

export type PendingConfirm = {
  id: string;
  name: string;
  from: Status;
  to: Status;
};

export type UserDialogState =
  | { kind: "invite" }
  | { kind: "role"; email: string; name: string; role: string }
  | { kind: "deactivate"; email: string; name: string; reactivate: boolean };

export type Toast = {
  id: string;
  kind: "ok" | "err";
  title: string;
  body: string;
  canRetry?: boolean;
  retryPayload?: PendingConfirm;
};
