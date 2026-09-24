"use client";

import { useMemo } from "react";
import { ArrowCounterClockwise, DownloadSimple, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { filterRecords, hasActiveFilters } from "@/lib/selectors";
import type { Filters } from "@/lib/types";

const ALL = "__all__";

function FilterSelect({
  id,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  const items: Record<string, React.ReactNode> = { [ALL]: placeholder };
  for (const o of options) items[o] = o;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select items={items} value={value === "" ? ALL : value} onValueChange={(v) => onChange(!v || v === ALL ? "" : v)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function FiltersPanel() {
  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const records = useAppStore((s) => s.records);
  const exportCsv = useAppStore((s) => s.exportCsv);

  const facilities = useMemo(
    () => Array.from(new Set(records.map((r) => r.facility).filter(Boolean))).sort(),
    [records],
  );

  const active = hasActiveFilters(filters);

  const chipDefs: { key: keyof Filters; label: string }[] = [
    { key: "name", label: `Name: ${filters.name}` },
    { key: "phone", label: `Phone: ${filters.phone}` },
    { key: "nin", label: `NIN: ${filters.nin}` },
    { key: "facility", label: `Facility: ${filters.facility}` },
    { key: "gender", label: `Gender: ${filters.gender}` },
    { key: "marital", label: `Marital: ${filters.marital}` },
    { key: "status", label: `Status: ${filters.status}` },
    { key: "expiry", label: `Expires by: ${filters.expiry}` },
  ];
  const chips = chipDefs.filter((c) => filters[c.key] !== "");

  return (
    <section
      aria-label="Search and filters"
      className="elev-sm flex flex-col gap-3 rounded-md bg-card p-4"
    >
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(172px, 1fr))" }}>
        <div className="space-y-1.5">
          <Label htmlFor="f-name">Search by name</Label>
          <Input id="f-name" type="search" placeholder="Aisha Bello" value={filters.name} onChange={(e) => setFilter("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-phone">Search by phone number</Label>
          <Input id="f-phone" type="search" placeholder="0800 000 0000" value={filters.phone} onChange={(e) => setFilter("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-nin">Search by NIN</Label>
          <Input id="f-nin" type="search" placeholder="0000 0000 000" value={filters.nin} onChange={(e) => setFilter("nin", e.target.value)} />
        </div>
        <FilterSelect id="f-facility" label="Facility" value={filters.facility} onChange={(v) => setFilter("facility", v)} placeholder="All facilities" options={facilities} />
        <FilterSelect id="f-gender" label="Gender" value={filters.gender} onChange={(v) => setFilter("gender", v)} placeholder="All" options={["Female", "Male"]} />
        <FilterSelect id="f-marital" label="Marital status" value={filters.marital} onChange={(v) => setFilter("marital", v)} placeholder="All" options={["Single", "Married", "Divorced", "Widowed"]} />
        <FilterSelect id="f-status" label="Enrollment status" value={filters.status} onChange={(v) => setFilter("status", v)} placeholder="All statuses" options={["Active", "Pending", "Expired", "Suspended", "Inactive"]} />
        <div className="space-y-1.5">
          <Label htmlFor="f-expiry">Expires on or before</Label>
          <Input id="f-expiry" type="date" value={filters.expiry} onChange={(e) => setFilter("expiry", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <div className="mr-auto flex flex-wrap items-center gap-2">
            <span className="text-[11px] tracking-wide text-muted-foreground uppercase">Active filters</span>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key, "")}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary px-2.5 py-0.5 text-[11.5px] text-primary"
              >
                <span>{c.label}</span>
                <X size={11} />
              </button>
            ))}
          </div>
        ) : (
          <div className="mr-auto text-[12px] text-muted-foreground">No filters applied · showing all records</div>
        )}
        <Button variant="outline" onClick={resetFilters}>
          <ArrowCounterClockwise size={14} />
          <span>Reset filters</span>
        </Button>
        <Button onClick={() => exportCsv(filterRecords(records, filters))}>
          <DownloadSimple size={14} />
          <span>Export CSV</span>
        </Button>
      </div>
    </section>
  );
}
