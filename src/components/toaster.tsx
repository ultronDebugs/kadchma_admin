"use client";

import { ArrowClockwise, CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const retryToast = useAppStore((s) => s.retryToast);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-[95] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 sm:right-6 sm:bottom-6"
    >
      {toasts.map((t) => {
        const accent = t.kind === "err" ? "var(--st-expired-fg)" : "var(--st-active-fg)";
        return (
          <div
            key={t.id}
            className="elev-lg animate-in fade-in slide-in-from-bottom-2 flex items-start gap-2.5 rounded-md border-l-[3px] bg-card p-3 duration-200"
            style={{ borderLeftColor: accent }}
          >
            <span className="mt-0.5 flex-none" style={{ color: accent }}>
              {t.kind === "err" ? <WarningCircle size={17} weight="fill" /> : <CheckCircle size={17} weight="fill" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">{t.title}</div>
              <div className="text-[12.5px] leading-snug text-muted-foreground">{t.body}</div>
              {t.canRetry && t.retryPayload && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto px-0 text-primary"
                  onClick={() => retryToast(t.id, t.retryPayload!)}
                >
                  <ArrowClockwise size={13} />
                  <span>Retry update</span>
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(t.id)}
            >
              <X size={13} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
