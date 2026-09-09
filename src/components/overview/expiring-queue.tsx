"use client";

import { useRouter } from "next/navigation";
import { InitialsAvatar } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { daysTo, fmt } from "@/lib/mock-data";

export function ExpiringQueue() {
  const records = useAppStore((s) => s.records);
  const expiryWarningDays = useAppStore((s) => s.expiryWarningDays);
  const openRecord = useAppStore((s) => s.openRecord);
  const router = useRouter();

  const expiring = records
    .filter((r) => {
      const d = daysTo(r.expiry);
      return d >= 0 && d <= expiryWarningDays;
    })
    .sort((a, b) => a.expiry.getTime() - b.expiry.getTime())
    .slice(0, 6);

  return (
    <section className="elev-sm rounded-md bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[15px] font-medium">Expiring within {expiryWarningDays} days</h2>
        <Badge
          variant="outline"
          style={{ background: "var(--st-pending-bg)", color: "var(--st-pending-fg)", borderColor: "var(--st-pending-bd)" }}
        >
          {expiring.length}
        </Badge>
      </div>
      <div className="flex flex-col">
        {expiring.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              router.push("/");
              openRecord(r.id);
            }}
            className="flex items-center gap-3 border-b py-2.5 text-left last:border-b-0"
          >
            <InitialsAvatar first={r.first} last={r.last} size={30} className="text-[11px]" />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium">{r.first} {r.last}</div>
              <div className="truncate text-[11.5px] text-muted-foreground">{r.facility}</div>
            </div>
            <div className="flex-none text-right">
              <div className="tabular-nums text-[12.5px]">{fmt(r.expiry)}</div>
              <div className="text-[11.5px] font-medium" style={{ color: "var(--st-pending-fg)" }}>
                {daysTo(r.expiry)} days left
              </div>
            </div>
          </button>
        ))}
        {expiring.length === 0 && (
          <p className="py-3 text-[13px] text-muted-foreground">No enrollments are expiring soon.</p>
        )}
      </div>
    </section>
  );
}
