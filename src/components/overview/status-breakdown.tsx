"use client";

import { useAppStore } from "@/lib/store";
import { STATUSES, statusTone } from "@/lib/mock-data";

export function StatusBreakdown() {
  const records = useAppStore((s) => s.records);

  return (
    <section className="elev-sm rounded-md bg-card p-4">
      <h2 className="mb-4 text-[15px] font-medium">Status breakdown</h2>
      <div className="flex flex-col gap-3">
        {STATUSES.map((k) => {
          const n = records.filter((r) => r.status === k).length;
          const pct = records.length ? Math.round((n / records.length) * 100) : 0;
          const tone = statusTone(k);
          return (
            <div key={k} className="flex flex-col gap-1.5">
              <div className="flex items-baseline gap-2 text-[12.5px]">
                <span className="font-medium">{k}</span>
                <span className="ml-auto tabular-nums text-muted-foreground">{n} · {pct}%</span>
              </div>
              <div className="h-[7px] overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone.fg }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
