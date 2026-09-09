"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClockCounterClockwise,
  Heartbeat,
  IdentificationCard,
  SquaresFour,
  UsersThree,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/overview", label: "Dashboard / Overview", icon: SquaresFour },
  { href: "/", label: "Informal Sector Enrollment", icon: IdentificationCard },
  { href: "/audit", label: "Audit Log", icon: ClockCounterClockwise },
  { href: "/users", label: "User Management", icon: UsersThree },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="flex size-[34px] flex-none items-center justify-center rounded-md border border-primary text-primary">
            <Heartbeat size={19} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-heading text-[15px] font-semibold tracking-wide">KADCHMA</div>
            <div className="text-[10.5px] leading-tight text-muted-foreground">
              Kaduna State Contributory Health Management Authority
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                    >
                      <item.icon size={17} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
