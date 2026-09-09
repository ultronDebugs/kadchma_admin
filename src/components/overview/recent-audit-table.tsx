"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/lib/store";
import { fmtDT } from "@/lib/mock-data";

export function RecentAuditTable() {
  const audit = useAppStore((s) => s.audit);
  const rows = audit.filter((a) => a.action === "Status change").slice(0, 6);

  return (
    <section className="elev-sm rounded-md bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-[15px] font-medium">Recent status changes</h2>
        <Button variant="ghost" size="sm" className="ml-auto" nativeButton={false} render={<Link href="/audit" />}>
          <span>Open audit log</span>
          <ArrowRight size={13} />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b text-[11px] tracking-wide text-muted-foreground uppercase">
              <th className="py-2 text-left font-medium">Timestamp</th>
              <th className="py-2 text-left font-medium">Administrator</th>
              <th className="py-2 text-left font-medium">Enrollee</th>
              <th className="py-2 text-left font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => (
              <tr key={i} className="border-b last:border-b-0">
                <td className="py-2.5 tabular-nums whitespace-nowrap">{fmtDT(a.at)}</td>
                <td className="py-2.5">{a.admin}</td>
                <td className="py-2.5">{a.enrollee}</td>
                <td className="py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    {a.from && <StatusBadge status={a.from} />}
                    <ArrowRight size={12} className="opacity-60" />
                    {a.to && <StatusBadge status={a.to} />}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
