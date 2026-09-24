"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/store";

export function SummaryCards() {
  const records = useAppStore((s) => s.records);
  const recordsStatus = useAppStore((s) => s.recordsStatus);
  const loading = recordsStatus === "loading" || recordsStatus === "idle";
  const empty = recordsStatus === "empty";

  const counts = (status: string) => (empty ? 0 : records.filter((r) => r.status === status).length);

  const cards = [
    { label: "Total enrollees", value: empty ? 0 : records.length, note: "All informal sector records", dot: "var(--primary)" },
    { label: "Active enrollments", value: counts("Active"), note: "Cover currently in force", dot: "var(--st-active-fg)" },
    { label: "Pending enrollments", value: counts("Pending"), note: "Awaiting verification or payment", dot: "var(--st-pending-fg)" },
    { label: "Expired enrollments", value: counts("Expired"), note: "Renewal required", dot: "var(--st-expired-fg)" },
    { label: "Suspended enrollments", value: counts("Suspended"), note: "Under administrative review", dot: "var(--st-suspended-fg)" },
  ];

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(178px, 1fr))" }}>
      {cards.map((c) => (
        <div key={c.label} className="elev-sm flex flex-col gap-1.5 rounded-md bg-card p-4">
          <div className="flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: c.dot }} />
            <span>{c.label}</span>
          </div>
          {loading ? (
            <Skeleton className="h-[30px] w-[76px]" />
          ) : (
            <div className="font-heading text-[30px] leading-none tracking-tight">{c.value}</div>
          )}
          <div className="text-[11.5px] text-muted-foreground">{c.note}</div>
        </div>
      ))}
    </div>
  );
}
