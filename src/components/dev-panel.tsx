"use client";

import { useState } from "react";
import { Flask } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { DataState } from "@/lib/types";

const STATES: { key: DataState; label: string }[] = [
  { key: "ready", label: "Records" },
  { key: "loading", label: "Loading" },
  { key: "empty", label: "Empty" },
  { key: "error", label: "Error" },
];

/**
 * Prototype-only control surface, ported from the design canvas so reviewers
 * can still preview loading/empty/error states without a real backend.
 */
export function DevPanel() {
  const [open, setOpen] = useState(true);
  const dataState = useAppStore((s) => s.dataState);
  const setDataState = useAppStore((s) => s.setDataState);
  const failNext = useAppStore((s) => s.failNext);
  const toggleFailNext = useAppStore((s) => s.toggleFailNext);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="elev-lg fixed bottom-4 left-4 z-[94] flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1.5 text-[11px] text-primary"
      >
        <Flask size={13} />
        <span>Prototype states</span>
      </button>
    );
  }

  return (
    <div className="elev-lg fixed bottom-4 left-4 z-[94] w-52 rounded-md bg-card p-3">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mb-2 flex w-full items-center gap-1.5 text-[10px] tracking-wide text-primary uppercase"
      >
        <Flask size={13} />
        <span>Prototype states</span>
      </button>
      <div className="flex flex-wrap gap-1.5">
        {STATES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setDataState(s.key)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-[11.5px]",
              dataState === s.key ? "border-primary text-primary" : "border-border text-foreground",
            )}
            style={dataState === s.key ? { background: "var(--accent)" } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11.5px]">
        <input
          type="checkbox"
          checked={failNext}
          onChange={toggleFailNext}
          className="size-3.5 accent-primary"
        />
        <span>Next status update fails</span>
      </label>
    </div>
  );
}
