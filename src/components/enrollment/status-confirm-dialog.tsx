"use client";

import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/lib/store";

export function StatusConfirmDialog() {
  const confirm = useAppStore((s) => s.confirm);
  const saving = useAppStore((s) => s.saving);
  const cancelConfirm = useAppStore((s) => s.cancelConfirm);
  const commitStatus = useAppStore((s) => s.commitStatus);

  return (
    <Dialog open={!!confirm} onOpenChange={(v) => !v && cancelConfirm()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm status change</DialogTitle>
        </DialogHeader>
        {confirm && (
          <div className="text-sm">
            <p className="mb-3">
              You are about to change the enrollment status for{" "}
              <strong className="text-foreground">{confirm.name}</strong>. This action is recorded in the audit log.
            </p>
            <div className="flex items-center gap-3 rounded-md bg-muted p-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">Current</div>
                <StatusBadge status={confirm.from} />
              </div>
              <ArrowRight size={17} className="flex-none opacity-55" />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">Proposed</div>
                <StatusBadge status={confirm.to} />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={cancelConfirm} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={commitStatus} disabled={saving}>
            {saving && <CircleNotch size={14} className="animate-spin" />}
            <span>{saving ? "Saving…" : "Confirm change"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
