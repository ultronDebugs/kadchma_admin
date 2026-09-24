"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/** Loads enrollments, audit log, and staff accounts once the dashboard mounts. */
export function LiveDataHydrator() {
  const hydrateRecords = useAppStore((s) => s.hydrateRecords);
  const hydrateAudit = useAppStore((s) => s.hydrateAudit);
  const hydrateUsers = useAppStore((s) => s.hydrateUsers);

  useEffect(() => {
    hydrateRecords();
    hydrateAudit();
    hydrateUsers();
  }, [hydrateRecords, hydrateAudit, hydrateUsers]);

  return null;
}
