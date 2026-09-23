"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/** Swaps in real enrollments from /api/enrollments when Google Sheets credentials are configured; silently keeps demo data otherwise. */
export function LiveDataHydrator() {
  const hydrateFromLive = useAppStore((s) => s.hydrateFromLive);

  useEffect(() => {
    hydrateFromLive();
  }, [hydrateFromLive]);

  return null;
}
