import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { RecordDrawer } from "@/components/enrollment/record-drawer";
import { StatusConfirmDialog } from "@/components/enrollment/status-confirm-dialog";
import { UserDialog } from "@/components/users/user-dialog";
import { Toaster } from "@/components/toaster";
import { DevPanel } from "@/components/dev-panel";
import { LiveDataHydrator } from "@/components/live-data-hydrator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex-1 px-4 pt-6 pb-16 sm:px-6">
          <div className="mx-auto flex max-w-[1360px] flex-col gap-6">{children}</div>
        </div>
      </SidebarInset>

      <RecordDrawer />
      <StatusConfirmDialog />
      <UserDialog />
      <Toaster />
      <DevPanel />
      <LiveDataHydrator />
    </SidebarProvider>
  );
}
