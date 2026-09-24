import { SummaryCards } from "@/components/enrollment/summary-cards";
import { FiltersPanel } from "@/components/enrollment/filters-panel";
import { RecordsTable } from "@/components/enrollment/records-table";

export default function EnrollmentPage() {
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-[720px]">
          <h1 className="mb-1.5 text-[27px] font-semibold">Informal Sector Enrollment</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Review informal sector enrollment records held in the KADCHMA database and update an enrollee&apos;s
            enrollment status. Every other field is read-only.
          </p>
        </div>
      </header>

      <SummaryCards />
      <FiltersPanel />
      <RecordsTable />
    </>
  );
}
