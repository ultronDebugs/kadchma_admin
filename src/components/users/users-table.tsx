"use client";

import { UserPlus, UsersThree, WarningOctagon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { InitialsAvatar, StatusBadge } from "@/components/status-badge";
import { useAppStore } from "@/lib/store";

export function UsersTable({ canManage }: { canManage: boolean }) {
  const users = useAppStore((s) => s.users);
  const usersStatus = useAppStore((s) => s.usersStatus);
  const hydrateUsers = useAppStore((s) => s.hydrateUsers);
  const openInvite = useAppStore((s) => s.openInvite);
  const openEditRole = useAppStore((s) => s.openEditRole);
  const openDeactivate = useAppStore((s) => s.openDeactivate);

  const loading = usersStatus === "loading" || usersStatus === "idle";
  const error = usersStatus === "error";
  const empty = usersStatus === "empty";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[12.5px] text-muted-foreground">
          {users.length} staff accounts · {users.filter((u) => u.account === "Active").length} active
        </div>
        {canManage && (
          <Button className="ml-auto" onClick={openInvite}>
            <UserPlus size={15} />
            <span>Register user</span>
          </Button>
        )}
      </div>

      <section className="elev-sm overflow-hidden rounded-md bg-card">
        {loading && (
          <div role="status" aria-live="polite" className="px-6 py-14 text-center text-[13px] text-muted-foreground">
            Loading administrators…
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <WarningOctagon size={30} style={{ color: "var(--st-expired-fg)" }} />
            <p className="text-[13px] text-muted-foreground">The directory service did not respond.</p>
            <Button onClick={hydrateUsers}>Retry</Button>
          </div>
        )}

        {empty && !loading && !error && (
          <div className="px-6 py-14 text-center">
            <UsersThree size={30} className="mx-auto opacity-45" />
            <p className="mt-2 text-[13px] text-muted-foreground">No administrator accounts to show.</p>
          </div>
        )}

        {!loading && !error && !empty && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 pl-4 text-left font-medium">Name</th>
                  <th className="py-2 text-left font-medium">Email</th>
                  <th className="py-2 text-left font-medium">Role</th>
                  <th className="py-2 text-left font-medium">Facility / LGA</th>
                  <th className="py-2 text-left font-medium">Last active</th>
                  <th className="py-2 text-left font-medium">Account</th>
                  {canManage && <th className="py-2 pr-4 text-right font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-b last:border-b-0">
                    <td className="py-3 pr-2 pl-4">
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar first={u.name.split(" ")[0]} last={u.name.split(" ")[1] ?? ""} seed={u.name} size={30} className="text-[11px]" />
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 text-muted-foreground">{u.email}</td>
                    <td className="py-3 pr-2">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px]" style={{ background: "var(--st-suspended-bg)", color: "var(--st-suspended-fg)", borderColor: "var(--st-suspended-bd)" }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-2">{u.scope}</td>
                    <td className="py-3 pr-2 whitespace-nowrap text-muted-foreground">{u.lastActive}</td>
                    <td className="py-3 pr-2"><StatusBadge status={u.account} /></td>
                    {canManage && (
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => openEditRole(u.email, u.name, u.role)}>Edit role</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[var(--st-expired-fg)]"
                            onClick={() => openDeactivate(u.email, u.name, u.account === "Suspended")}
                          >
                            {u.account === "Suspended" ? "Reactivate" : "Deactivate"}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
