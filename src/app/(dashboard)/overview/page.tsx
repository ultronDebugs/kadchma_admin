import { SummaryCards } from "@/components/enrollment/summary-cards";
import { StatusBreakdown } from "@/components/overview/status-breakdown";
import { ExpiringQueue } from "@/components/overview/expiring-queue";
import { RecentAuditTable } from "@/components/overview/recent-audit-table";

export default function OverviewPage() {
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-[720px]">
          <h1 className="mb-1.5 text-[27px] font-semibold">Dashboard overview</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Enrollment health across the informal sector programme: totals by status, renewals falling due, and the
            most recent administrative activity.
          </p>
        </div>
      </header>

      <SummaryCards />

      <div className="grid items-start gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <StatusBreakdown />
        <ExpiringQueue />
      </div>

      <RecentAuditTable />
    </>
  );
}
