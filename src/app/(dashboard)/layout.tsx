import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecordDrawer } from "@/components/enrollment/record-drawer";
import { StatusConfirmDialog } from "@/components/enrollment/status-confirm-dialog";
import { UserDialog } from "@/components/users/user-dialog";
import { Toaster } from "@/components/toaster";
import { LiveDataHydrator } from "@/components/live-data-hydrator";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader user={user} />
        <div className="flex-1 px-4 pt-6 pb-16 sm:px-6">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>

      <RecordDrawer />
      <StatusConfirmDialog />
      <UserDialog />
      <Toaster />
      <LiveDataHydrator />
    </SidebarProvider>
  );
}
