"use client";

import { useMemo } from "react";
import { ArrowRight, ClockCounterClockwise, WarningOctagon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { InitialsAvatar, StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/lib/store";
import { filterAudit } from "@/lib/selectors";
import { fmtDT } from "@/lib/mock-data";

export function AuditTable() {
  const audit = useAppStore((s) => s.audit);
  const auditFilters = useAppStore((s) => s.auditFilters);
  const auditStatus = useAppStore((s) => s.auditStatus);
  const hydrateAudit = useAppStore((s) => s.hydrateAudit);

  const loading = auditStatus === "loading" || auditStatus === "idle";
  const error = auditStatus === "error";

  const rows = useMemo(() => (loading || error ? [] : filterAudit(audit, auditFilters)), [audit, auditFilters, loading, error]);

  return (
    <section className="elev-sm overflow-hidden rounded-md bg-card">
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <h2 className="text-[15px] font-medium">Audit trail</h2>
        <span className="text-[12px] text-muted-foreground">{rows.length} entries</span>
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="px-6 py-14 text-center text-[13px] text-muted-foreground">
          Loading audit entries…
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <WarningOctagon size={30} style={{ color: "var(--st-expired-fg)" }} />
          <p className="text-[13px] text-muted-foreground">The audit service did not respond.</p>
          <Button onClick={hydrateAudit}>Retry</Button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="px-6 py-14 text-center">
          <ClockCounterClockwise size={30} className="mx-auto opacity-45" />
          <p className="mt-2 text-[13px] text-muted-foreground">No audit entries match these filters.</p>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-[11px] tracking-wide text-muted-foreground uppercase">
                <th className="py-2 pl-4 text-left font-medium">Timestamp</th>
                <th className="py-2 text-left font-medium">Administrator</th>
                <th className="py-2 text-left font-medium">Action</th>
                <th className="py-2 text-left font-medium">Enrollee</th>
                <th className="py-2 pr-4 text-left font-medium">Previous → New</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-3 pr-2 pl-4 tabular-nums whitespace-nowrap">{fmtDT(a.at)}</td>
                  <td className="py-3 pr-2">
                    <div className="flex items-center gap-2">
                      <InitialsAvatar first={a.admin.split(" ")[0]} last={a.admin.split(" ")[1] ?? ""} seed={a.admin} size={26} className="text-[10px]" />
                      <span>{a.admin}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-2">
                    <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px]" style={{ background: "var(--st-inactive-bg)", color: "var(--st-inactive-fg)", borderColor: "var(--st-inactive-bd)" }}>
                      {a.action}
                    </span>
                  </td>
                  <td className="py-3 pr-2">{a.enrollee}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center gap-1.5">
                      {a.from ? <StatusBadge status={a.from} /> : <span>—</span>}
                      <ArrowRight size={12} className="opacity-60" />
                      {a.to ? <StatusBadge status={a.to} /> : <span>—</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
