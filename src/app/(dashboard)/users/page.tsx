import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
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
        <div className="text-[12px] text-muted-foreground">Records fetched from KADCHMA enrollment database · synced 05 Sep 2026, 09:12</div>
      </header>

      <UsersTable />
    </>
  );
}
