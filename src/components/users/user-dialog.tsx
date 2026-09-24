"use client";

import { useState } from "react";
import { CircleNotch } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { UserDialogState } from "@/lib/types";

const ROLES = ["Enrollment Officer", "Facility Supervisor", "Zonal Coordinator", "System Administrator"];

function UserDialogForm({ userDialog }: { userDialog: UserDialogState }) {
  const closeUserDialog = useAppStore((s) => s.closeUserDialog);
  const submitting = useAppStore((s) => s.userDialogSubmitting);
  const registerUser = useAppStore((s) => s.registerUser);
  const changeUserRole = useAppStore((s) => s.changeUserRole);
  const setUserAccount = useAppStore((s) => s.setUserAccount);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scope, setScope] = useState("");
  const [role, setRole] = useState(userDialog.kind === "role" ? userDialog.role : ROLES[0]);
  const [error, setError] = useState("");

  const title =
    userDialog.kind === "invite" ? "Register a user" : userDialog.kind === "role" ? "Change role" : userDialog.reactivate ? "Reactivate account" : "Deactivate account";
  const body =
    userDialog.kind === "invite"
      ? "Create a staff account for the enrollment dashboard."
      : userDialog.kind === "role"
        ? `Changing the role for ${userDialog.name} takes effect at their next sign-in.`
        : `${userDialog.reactivate ? "Reactivate" : "Deactivate"} ${userDialog.name}? ${userDialog.reactivate ? "Access is restored immediately." : "They lose access immediately; their audit history is retained."}`;
  const confirmLabel =
    userDialog.kind === "invite" ? "Register user" : userDialog.kind === "role" ? "Save role" : userDialog.reactivate ? "Reactivate" : "Deactivate";

  async function handleConfirm() {
    setError("");

    if (userDialog.kind === "invite") {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (!name || !email.trim() || password.length < 12) {
        setError("Name, email, and a password of at least 12 characters are required.");
        return;
      }
      await registerUser({ name, email: email.trim(), password, role, scope: scope.trim() });
      return;
    }
    if (userDialog.kind === "role") {
      await changeUserRole(userDialog.email, role);
      return;
    }
    await setUserAccount(userDialog.email, userDialog.reactivate ? "Active" : "Suspended");
  }

  return (
    <DialogContent showCloseButton={false} className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="text-sm">
        <p className="mb-3">{body}</p>

        {userDialog.kind === "invite" && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-first">Firstname</Label>
                <Input id="reg-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-last">Last name</Label>
                <Input id="reg-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input id="reg-email" type="email" autoComplete="email" placeholder="name@kadchma.kd.gov.ng" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input id="reg-password" type="password" autoComplete="new-password" placeholder="Minimum 12 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="text-[11.5px] text-muted-foreground">Share this password with the new user out of band; they can sign in with it immediately.</div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-scope">Facility / LGA</Label>
              <Input id="reg-scope" placeholder="e.g. Kaduna North LGA" value={scope} onChange={(e) => setScope(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-type">User type</Label>
              <Select value={role} onValueChange={(v) => v && setRole(v)}>
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

        {userDialog.kind === "role" && (
          <div className="space-y-1.5">
            <Label htmlFor="role-select">New role</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
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

        {error && <p className="mt-2 text-[12.5px] text-[var(--st-expired-fg)]">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeUserDialog} disabled={submitting}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={submitting}>
          {submitting && <CircleNotch size={14} className="animate-spin" />}
          <span>{submitting ? "Saving…" : confirmLabel}</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function UserDialog() {
  const userDialog = useAppStore((s) => s.userDialog);
  const closeUserDialog = useAppStore((s) => s.closeUserDialog);
  const submitting = useAppStore((s) => s.userDialogSubmitting);

  const dialogKey = !userDialog ? "closed" : userDialog.kind === "invite" ? "invite" : `${userDialog.kind}-${userDialog.email}`;

  return (
    <Dialog open={!!userDialog} onOpenChange={(v) => !v && !submitting && closeUserDialog()}>
      {userDialog && <UserDialogForm key={dialogKey} userDialog={userDialog} />}
    </Dialog>
  );
}
