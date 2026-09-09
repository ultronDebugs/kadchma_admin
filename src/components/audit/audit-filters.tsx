"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore, ADMINS } from "@/lib/store";
import { ACTIONS } from "@/lib/mock-data";

const ALL = "__all__";

const adminItems: Record<string, React.ReactNode> = { [ALL]: "All administrators" };
for (const a of ADMINS) adminItems[a] = a;

const actionItems: Record<string, React.ReactNode> = { [ALL]: "All actions" };
for (const a of ACTIONS) actionItems[a] = a;

export function AuditFiltersPanel() {
  const auditFilters = useAppStore((s) => s.auditFilters);
  const setAuditFilter = useAppStore((s) => s.setAuditFilter);
  const resetAuditFilters = useAppStore((s) => s.resetAuditFilters);

  return (
    <section
      aria-label="Audit filters"
      className="elev-sm grid gap-3 rounded-md bg-card p-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="a-admin">Administrator</Label>
        <Select
          items={adminItems}
          value={auditFilters.admin === "" ? ALL : auditFilters.admin}
          onValueChange={(v) => setAuditFilter("admin", !v || v === ALL ? "" : v)}
        >
          <SelectTrigger id="a-admin" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All administrators</SelectItem>
            {ADMINS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-action">Action type</Label>
        <Select
          items={actionItems}
          value={auditFilters.action === "" ? ALL : auditFilters.action}
          onValueChange={(v) => setAuditFilter("action", !v || v === ALL ? "" : v)}
        >
          <SelectTrigger id="a-action" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All actions</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-from">From date</Label>
        <Input id="a-from" type="date" value={auditFilters.from} onChange={(e) => setAuditFilter("from", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="a-to">To date</Label>
        <Input id="a-to" type="date" value={auditFilters.to} onChange={(e) => setAuditFilter("to", e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button variant="outline" onClick={resetAuditFilters}>
          <ArrowCounterClockwise size={14} />
          <span>Reset</span>
        </Button>
      </div>
    </section>
  );
}
