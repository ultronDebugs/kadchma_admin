"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, CaretRight, MoonStars, SignOut, Sun } from "@phosphor-icons/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/lib/store";
import { daysTo, initialsOf } from "@/lib/mock-data";
import { useMounted } from "@/hooks/use-mounted";
import type { SessionUser } from "@/lib/types";

const TITLES: Record<string, { section: string; page: string }> = {
  "/overview": { section: "Dashboard", page: "Dashboard overview" },
  "/": { section: "Enrollment", page: "Informal Sector Enrollment" },
  "/audit": { section: "Governance", page: "Audit Log" },
  "/users": { section: "Administration", page: "User Management" },
};

export function DashboardHeader({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const crumb = TITLES[pathname] ?? TITLES["/"];
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const records = useAppStore((s) => s.records);
  const recordsStatus = useAppStore((s) => s.recordsStatus);
  const [signingOut, setSigningOut] = useState(false);

  const expiringCount = records.filter((r) => {
    const d = daysTo(r.expiry);
    return d >= 0 && d <= 60;
  }).length;
  const expiredCount = records.filter((r) => r.status === "Expired").length;
  const isDark = mounted && resolvedTheme === "dark";
  const hasCounts = recordsStatus === "ready" || recordsStatus === "empty";

  const [firstName, lastName] = [user.name.split(" ")[0], user.name.split(" ").slice(1).join(" ")];

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-card px-4 py-3 sm:px-6">
      <SidebarTrigger className="md:hidden" />

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <span>KADCHMA</span>
        <CaretRight size={11} />
        <span>{crumb.section}</span>
        <CaretRight size={11} />
        <span className="truncate font-medium text-foreground">{crumb.page}</span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Notifications" className="relative" />
            }
          >
            <Bell size={17} />
            {hasCounts && (expiringCount > 0 || expiredCount > 0) && (
              <span
                aria-hidden
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border px-1 text-[10px] font-semibold"
                style={{ background: "var(--st-expired-bg)", color: "var(--st-expired-fg)", borderColor: "var(--st-expired-bd)" }}
              >
                {expiringCount + expiredCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[300px]">
            <div className="mb-1 text-[11px] tracking-wide text-muted-foreground uppercase">Notifications</div>
            {!hasCounts ? (
              <div className="text-[13px] text-muted-foreground">Loading…</div>
            ) : expiringCount === 0 && expiredCount === 0 ? (
              <div className="text-[13px] text-muted-foreground">No renewal notices right now.</div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {expiringCount > 0 && (
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-[15px] leading-none text-[var(--st-pending-fg)]">●</span>
                    <div className="text-[13px] leading-snug">{expiringCount} enrollments expire within 60 days</div>
                  </div>
                )}
                {expiredCount > 0 && (
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-[15px] leading-none text-[var(--st-expired-fg)]">●</span>
                    <div className="text-[13px] leading-snug">{expiredCount} expired enrollments await renewal capture</div>
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Button
          variant="outline"
          size="icon"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun size={17} /> : <MoonStars size={17} />}
        </Button>

        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="hidden items-center gap-2.5 rounded-full border py-1 pr-2.5 pl-1 sm:flex"
              />
            }
          >
            <div
              className="flex size-7 flex-none items-center justify-center rounded-full text-[11px] font-semibold"
              style={{ background: "var(--st-suspended-bg)", color: "var(--st-suspended-fg)" }}
            >
              {initialsOf(firstName, lastName)}
            </div>
            <div className="leading-tight text-left">
              <div className="text-[12.5px] font-medium">{user.name}</div>
              <div className="text-[10.5px] text-muted-foreground">{user.role}</div>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[220px]">
            <div className="mb-2 text-[12px] text-muted-foreground">{user.email}</div>
            <Button variant="outline" size="sm" className="w-full" disabled={signingOut} onClick={handleSignOut}>
              <SignOut size={14} />
              <span>{signingOut ? "Signing out…" : "Sign out"}</span>
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
