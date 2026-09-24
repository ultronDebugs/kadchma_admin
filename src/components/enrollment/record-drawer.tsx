"use client";

import { ArrowLeft, CircleNotch, ClockCounterClockwise, WarningCircle, ClockCountdown, WarningOctagon, X } from "@phosphor-icons/react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, InitialsAvatar } from "@/components/status-badge";
import { EnrollmentPhoto } from "@/components/enrollment/enrollment-photo";
import { useAppStore } from "@/lib/store";
import { STATUSES, daysTo, fmt, fmtDT, na } from "@/lib/mock-data";
import { historyForEnrollment } from "@/lib/selectors";
import type { Status } from "@/lib/types";

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <dt className="mb-0.5 text-[12px] text-muted-foreground">{label}</dt>
      <dd className="text-[14px] leading-snug break-words">{value}</dd>
    </div>
  );
}

export function RecordDrawer() {
  const selectedId = useAppStore((s) => s.selectedId);
  const drawerState = useAppStore((s) => s.drawerState);
  const draftStatus = useAppStore((s) => s.draftStatus);
  const saving = useAppStore((s) => s.saving);
  const records = useAppStore((s) => s.records);
  const audit = useAppStore((s) => s.audit);
  const closeDrawer = useAppStore((s) => s.closeDrawer);
  const retryDrawer = useAppStore((s) => s.retryDrawer);
  const pickStatus = useAppStore((s) => s.pickStatus);
  const expiryWarningDays = useAppStore((s) => s.expiryWarningDays);

  const rec = records.find((r) => r.id === selectedId);
  const open = !!selectedId;
  const history = rec ? historyForEnrollment(audit, rec.id) : [];

  const days = rec ? daysTo(rec.expiry) : 0;
  const expired = days < 0;
  const soon = days >= 0 && days <= expiryWarningDays;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-[min(620px,92vw)] gap-0 p-0 sm:max-w-[min(620px,92vw)]"
        showCloseButton={false}
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-center gap-3 border-b bg-popover px-6 py-4">
          <SheetTitle className="sr-only">Enrollment details</SheetTitle>
          <Button variant="outline" onClick={closeDrawer}>
            <ArrowLeft size={14} />
            <span>Back to records</span>
          </Button>
          <Button variant="outline" size="icon" aria-label="Close details" className="ml-auto" onClick={closeDrawer}>
            <X size={16} />
          </Button>
        </SheetHeader>

        {drawerState === "loading" && (
          <div role="status" aria-live="polite" className="px-6 py-18 text-center text-[13px] text-muted-foreground">
            <CircleNotch size={24} className="mx-auto mb-3 animate-spin" />
            <div>Loading enrollment profile…</div>
          </div>
        )}

        {drawerState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-18 text-center">
            <WarningOctagon size={30} style={{ color: "var(--st-expired-fg)" }} />
            <p className="text-[13px] text-muted-foreground">This enrollment profile could not be loaded.</p>
            <Button onClick={retryDrawer}>Retry</Button>
          </div>
        )}

        {drawerState === "ready" && rec && (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <InitialsAvatar first={rec.first} last={rec.last} size={62} className="text-xl" />
              <div className="min-w-0">
                <h2 className="mb-1 text-[22px] font-semibold">{rec.first} {rec.last}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={rec.status} />
                  <span className="text-[12px] text-muted-foreground">Enrollment ID {rec.id}</span>
                </div>
              </div>
            </div>

            {(expired || soon) && (
              <div
                role="note"
                className="flex gap-2.5 rounded-md border p-3"
                style={{
                  background: expired ? "var(--st-expired-bg)" : "var(--st-pending-bg)",
                  borderColor: expired ? "var(--st-expired-bd)" : "var(--st-pending-bd)",
                }}
              >
                {expired ? (
                  <WarningCircle size={18} weight="fill" className="mt-0.5 flex-none" style={{ color: "var(--st-expired-fg)" }} />
                ) : (
                  <ClockCountdown size={18} weight="fill" className="mt-0.5 flex-none" style={{ color: "var(--st-pending-fg)" }} />
                )}
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold" style={{ color: expired ? "var(--st-expired-fg)" : "var(--st-pending-fg)" }}>
                    {expired ? "Enrollment expired" : "Enrollment expiring soon"}
                  </div>
                  <div className="text-[12.5px] leading-snug" style={{ color: expired ? "var(--st-expired-fg)" : "var(--st-pending-fg)" }}>
                    {expired
                      ? `Expired on ${fmt(rec.expiry)} — ${Math.abs(days)} days ago. Renewal must be captured at the assigned facility before cover resumes.`
                      : `Expires on ${fmt(rec.expiry)} — ${days} days remaining. Contact the enrollee through their preferred channel (${rec.channel}).`}
                  </div>
                </div>
              </div>
            )}

            <section>
              <h3 className="mb-3 text-[11px] font-medium tracking-wide text-primary uppercase">Personal information</h3>
              <div className="mb-3 flex items-center gap-3 border-b pb-3">
                <EnrollmentPhoto key={rec.id} enrollmentId={rec.id} hasPicture={rec.hasPicture} />
                <div>
                  <div className="text-[12px] text-muted-foreground">Picture</div>
                  <div className="text-[13.5px]">
                    {rec.hasPicture ? "Photograph on file · tap to view full size" : "N/A — no photograph captured"}
                  </div>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-2">
                <Field label="Firstname" value={rec.first} />
                <Field label="Surname" value={rec.last} />
                <Field label="Other names" value={na(rec.other)} />
                <Field label="NIN" value={rec.nin} />
                <Field label="Date of birth" value={fmt(rec.dob)} />
                <Field label="Gender" value={rec.gender} />
                <Field label="Marital status" value={rec.marital} />
                <Field label="Disability" value={na(rec.disability)} />
              </dl>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-medium tracking-wide text-primary uppercase">Contact information</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Residential address" value={rec.address} span />
                <Field label="Phone number" value={rec.phone} />
                <Field label="Contact channel" value={rec.channel} />
              </dl>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-medium tracking-wide text-primary uppercase">Enrollment information</h3>
              <div className="mb-4 max-w-80">
                <label htmlFor="status-select" className="mb-1.5 block text-[12px] text-muted-foreground">
                  Enrollment status <span className="text-primary">· editable</span>
                </label>
                <Select value={draftStatus ?? rec.status} onValueChange={(v) => pickStatus(v as Status)} disabled={saving}>
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-1.5 text-[11.5px] text-muted-foreground">
                  A confirmation is required before the change is saved. Every other field on this record is read-only.
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Facility" value={rec.facility} span />
                <Field label="Enrollment expiry date" value={fmt(rec.expiry)} />
                <Field label="Note / comment" value={na(rec.note)} span />
              </dl>
            </section>

            <section>
              <h3 className="mb-3 text-[11px] font-medium tracking-wide text-primary uppercase">Status change history</h3>
              {history.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">No status changes recorded for this enrollment.</p>
              ) : (
                <div className="flex flex-col">
                  {history.map((h, i) => (
                    <div key={i} className="flex gap-3 border-b py-3 last:border-b-0">
                      <ClockCounterClockwise size={15} className="mt-1 flex-none text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {h.from ? <StatusBadge status={h.from} /> : <span>—</span>}
                          <span className="text-muted-foreground">→</span>
                          {h.to ? <StatusBadge status={h.to} /> : <span>—</span>}
                        </div>
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          {h.admin} · {fmtDT(h.at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
