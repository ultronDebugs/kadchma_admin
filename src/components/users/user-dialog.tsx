"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

const ROLES = ["Enrollment Officer", "Facility Supervisor", "Zonal Coordinator", "System Administrator"];

export function UserDialog() {
  const userDialog = useAppStore((s) => s.userDialog);
  const closeUserDialog = useAppStore((s) => s.closeUserDialog);
  const confirmUserDialog = useAppStore((s) => s.confirmUserDialog);

  const title = !userDialog
    ? ""
    : userDialog.kind === "invite" ? "Register a user" : userDialog.kind === "role" ? "Change role" : userDialog.reactivate ? "Reactivate account" : "Deactivate account";
  const body = !userDialog
    ? ""
    : userDialog.kind === "invite"
      ? "Create a staff account for the enrollment dashboard. The user signs in with this email and is prompted to set their own password."
      : userDialog.kind === "role"
        ? `Changing the role for ${userDialog.name} takes effect at their next sign-in and is recorded in the audit log.`
        : `${userDialog.reactivate ? "Reactivate" : "Deactivate"} ${userDialog.name}? ${userDialog.reactivate ? "Access is restored immediately." : "They lose access immediately; their audit history is retained."}`;
  const confirmLabel = !userDialog
    ? ""
    : userDialog.kind === "invite" ? "Register user" : userDialog.kind === "role" ? "Save role" : userDialog.reactivate ? "Reactivate" : "Deactivate";

  return (
    <Dialog open={!!userDialog} onOpenChange={(v) => !v && closeUserDialog()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm">
          <p className="mb-3">{body}</p>

          {userDialog?.kind === "invite" && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-first">Firstname</Label>
                  <Input id="reg-first" autoComplete="given-name" placeholder="Hadiza" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-last">Last name</Label>
                  <Input id="reg-last" autoComplete="family-name" placeholder="Aliyu" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input id="reg-email" type="email" autoComplete="email" placeholder="name@kadchma.kd.gov.ng" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" autoComplete="new-password" placeholder="Minimum 12 characters" />
                <div className="text-[11.5px] text-muted-foreground">The user is prompted to change this at first sign-in.</div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-type">User type</Label>
                <Select defaultValue={ROLES[0]}>
                  <SelectTrigger id="reg-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {userDialog?.kind === "role" && (
            <div className="space-y-1.5">
              <Label htmlFor="role-select">New role</Label>
              <Select defaultValue={ROLES[0]}>
                <SelectTrigger id="role-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeUserDialog}>Cancel</Button>
          <Button onClick={confirmUserDialog}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
