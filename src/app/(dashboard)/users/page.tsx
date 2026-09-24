import { UsersTable } from "@/components/users/users-table";
import { getSessionUser } from "@/lib/session";

export default async function UsersPage() {
  const session = await getSessionUser();
  const canManage = session?.role === "System Administrator";

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-[720px]">
          <h1 className="mb-1.5 text-[27px] font-semibold">User Management</h1>
          <p className="text-[13.5px] leading-relaxed text-muted-foreground">
            Staff accounts with access to the enrollment dashboard, their assigned facility or LGA, and account
            state.
          </p>
        </div>
      </header>

      <UsersTable canManage={canManage} />
    </>
  );
}
