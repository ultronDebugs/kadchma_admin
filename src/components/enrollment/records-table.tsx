"use client";

import { useMemo } from "react";
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretUpDown,
  FolderOpen,
  WarningCircle,
  WarningOctagon,
  ClockCountdown,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, InitialsAvatar } from "@/components/status-badge";
import { useAppStore } from "@/lib/store";
import { filterRecords, hasActiveFilters, sortRecords } from "@/lib/selectors";
import { fmt, warnFor } from "@/lib/mock-data";

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  const Icon = !active ? CaretUpDown : dir === "asc" ? CaretUp : CaretDown;
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-inherit">
      <span>{label}</span>
      <Icon size={12} weight={active ? "fill" : "regular"} />
    </button>
  );
}

function sortAria(active: boolean, dir: "asc" | "desc"): "ascending" | "descending" | "none" {
  return !active ? "none" : dir === "asc" ? "ascending" : "descending";
}

export function RecordsTable() {
  const records = useAppStore((s) => s.records);
  const filters = useAppStore((s) => s.filters);
  const sortKey = useAppStore((s) => s.sortKey);
  const sortDir = useAppStore((s) => s.sortDir);
  const sortBy = useAppStore((s) => s.sortBy);
  const pageNo = useAppStore((s) => s.pageNo);
  const perPage = useAppStore((s) => s.perPage);
  const setPageNo = useAppStore((s) => s.setPageNo);
  const setPerPage = useAppStore((s) => s.setPerPage);
  const dataState = useAppStore((s) => s.dataState);
  const openRecord = useAppStore((s) => s.openRecord);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const loading = dataState === "loading";
  const error = dataState === "error";
  const empty = dataState === "empty";

  const all = useMemo(() => {
    if (empty || loading || error) return [];
    return sortRecords(filterRecords(records, filters), sortKey, sortDir);
  }, [records, filters, sortKey, sortDir, empty, loading, error]);

  const total = all.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const clampedPage = Math.min(pageNo, pageCount);
  const slice = all.slice((clampedPage - 1) * perPage, clampedPage * perPage);
  const active = hasActiveFilters(filters);

  const from = Math.max(1, Math.min(clampedPage - 1, pageCount - 2));
  const pageButtons = [];
  for (let p = from; p <= Math.min(pageCount, from + 2); p++) pageButtons.push(p);

  const showTable = !loading && !error && total > 0;
  const showEmpty = !loading && !error && total === 0;

  return (
    <section aria-label="Enrollment records" className="elev-sm overflow-hidden rounded-md bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <h2 className="text-[15px] font-medium">Enrollment records</h2>
        <span className="text-[12px] text-muted-foreground">
          {total} {total === 1 ? "record" : "records"} {active ? "matching filters" : "in register"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Label>Rows per page</Label>
          <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
            <SelectTrigger className="h-8 w-[76px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="p-4">
          {["84px", "112px", "96px", "128px", "92px", "104px"].map((w, i) => (
            <div key={i} className="flex items-center gap-3 border-b py-3.5 last:border-b-0">
              <Skeleton className="size-[34px] flex-none rounded-full" />
              <Skeleton className="h-3 flex-1 rounded-full" />
              <Skeleton className="h-3 rounded-full" style={{ width: w }} />
            </div>
          ))}
          <div role="status" aria-live="polite" className="pt-3 text-[12.5px] text-muted-foreground">
            Loading enrollment records…
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <WarningOctagon size={32} style={{ color: "var(--st-expired-fg)" }} />
          <div>
            <h3 className="mb-1 text-[18px] font-semibold">Could not load enrollment records</h3>
            <p className="mx-auto max-w-[420px] text-[13px] text-muted-foreground">
              The enrollment service did not respond. Your filters have been kept — retry the request or contact the KADCHMA ICT desk.
            </p>
          </div>
          <Button onClick={() => useAppStore.getState().setDataState("ready")}>Retry</Button>
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <FolderOpen size={32} className="opacity-45" />
          <div>
            <h3 className="mb-1 text-[18px] font-semibold">
              {active ? "No records match these filters" : "No enrollment records yet"}
            </h3>
            <p className="mx-auto max-w-[420px] text-[13px] text-muted-foreground">
              {active
                ? "Nothing in the enrollment database matches the current search and filter combination. Adjust or clear the filters to widen the result set."
                : "The informal sector enrollment register returned no records for your assigned facility or LGA."}
            </p>
          </div>
          {active && (
            <Button variant="outline" onClick={resetFilters}>Clear all filters</Button>
          )}
        </div>
      )}

      {showTable && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[940px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="w-14 py-2 pl-4"><span className="sr-only">Picture</span></th>
                  <th className="py-2 text-left font-medium" aria-sort={sortAria(sortKey === "name", sortDir)}>
                    <SortHeader label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => sortBy("name")} />
                  </th>
                  <th className="py-2 text-left font-medium" aria-sort={sortAria(sortKey === "dob", sortDir)}>
                    <SortHeader label="Date of birth" active={sortKey === "dob"} dir={sortDir} onClick={() => sortBy("dob")} />
                  </th>
                  <th className="py-2 text-left font-medium">Gender</th>
                  <th className="py-2 text-left font-medium">Marital status</th>
                  <th className="py-2 text-left font-medium">Phone number</th>
                  <th className="py-2 text-left font-medium" aria-sort={sortAria(sortKey === "status", sortDir)}>
                    <SortHeader label="Enrollment status" active={sortKey === "status"} dir={sortDir} onClick={() => sortBy("status")} />
                  </th>
                  <th className="py-2 pr-4 text-left font-medium">Contact channel</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => {
                  const w = warnFor(r);
                  return (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      aria-label={`Open enrollment details for ${r.first} ${r.last}`}
                      onClick={() => openRecord(r.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openRecord(r.id);
                        }
                      }}
                      className="cursor-pointer border-b last:border-b-0 hover:bg-muted/40"
                    >
                      <td className="py-3 pr-2 pl-4">
                        <InitialsAvatar first={r.first} last={r.last} />
                      </td>
                      <td className="py-3 pr-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-medium">{r.first} {r.last}</span>
                          {w.warn && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: w.warnFg }}>
                              {w.warnText.startsWith("Enrollment expired") ? <WarningCircle size={12} weight="fill" /> : <ClockCountdown size={12} weight="fill" />}
                              <span>{w.warnText}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-2 whitespace-nowrap">{fmt(r.dob)}</td>
                      <td className="py-3 pr-2">
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px]" style={{ background: "var(--st-inactive-bg)", color: "var(--st-inactive-fg)", borderColor: "var(--st-inactive-bd)" }}>
                          {r.gender}
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px]" style={{ background: "var(--st-inactive-bg)", color: "var(--st-inactive-fg)", borderColor: "var(--st-inactive-bd)" }}>
                          {r.marital}
                        </span>
                      </td>
                      <td className="py-3 pr-2 tabular-nums whitespace-nowrap">{r.phone}</td>
                      <td className="py-3 pr-2"><StatusBadge status={r.status} /></td>
                      <td className="py-3 pr-4 whitespace-nowrap">{r.channel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col sm:hidden">
            {slice.map((r) => {
              const w = warnFor(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => openRecord(r.id)}
                  className="flex min-h-[68px] w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0"
                >
                  <InitialsAvatar first={r.first} last={r.last} size={42} className="text-[13px]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[14.5px] font-medium">{r.first} {r.last}</span>
                    <span className="tabular-nums text-[12.5px] text-muted-foreground">{r.phone} · {r.channel}</span>
                    <StatusBadge status={r.status} className="self-start" />
                    {w.warn && (
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: w.warnFg }}>
                        <span>{w.warnText}</span>
                      </span>
                    )}
                  </div>
                  <CaretRight size={16} className="flex-none text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="text-[12.5px] text-muted-foreground">
              Showing {(clampedPage - 1) * perPage + 1}–{Math.min(total, clampedPage * perPage)} of {total}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="outline" size="icon" aria-label="Previous page" disabled={clampedPage <= 1} onClick={() => setPageNo(Math.max(1, clampedPage - 1))}>
                <CaretLeft size={15} />
              </Button>
              {pageButtons.map((p) => (
                <Button
                  key={p}
                  variant={p === clampedPage ? "default" : "outline"}
                  size="sm"
                  className="min-w-8"
                  onClick={() => setPageNo(p)}
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="icon" aria-label="Next page" disabled={clampedPage >= pageCount} onClick={() => setPageNo(Math.min(pageCount, clampedPage + 1))}>
                <CaretRight size={15} />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[12px] text-muted-foreground">{children}</span>;
}
