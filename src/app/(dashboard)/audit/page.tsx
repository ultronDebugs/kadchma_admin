import { AuditFiltersPanel } from "@/components/audit/audit-filters";
import { AuditTable } from "@/components/audit/audit-table";

export default function AuditPage() {
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-[720px]">
          <h1 className="mb-1.5 text-[27px] font-semibold">Audit Log</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            A traceable record of administrative activity. Every enrollment status change is logged with the
            administrator who made it.
          </p>
        </div>
      </header>

      <AuditFiltersPanel />
      <AuditTable />
    </>
  );
}
