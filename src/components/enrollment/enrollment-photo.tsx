"use client";

import { useEffect, useState } from "react";
import { CircleNotch, Image as ImageIcon, UserCircleDashed } from "@phosphor-icons/react";

export function EnrollmentPhoto({ enrollmentId, hasPicture }: { enrollmentId: string; hasPicture: boolean }) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(hasPicture ? "loading" : "idle");

  useEffect(() => {
    if (!hasPicture) return;
    let cancelled = false;
    fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}/photo`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        setDataUri(`data:${json.mime_type};base64,${json.photo_base64}`);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [enrollmentId, hasPicture]);

  if (status === "ready" && dataUri) {
    return (
      <button
        type="button"
        onClick={() => window.open(dataUri, "_blank")}
        className="flex size-[46px] flex-none items-center justify-center overflow-hidden rounded-md border"
        aria-label="Open full-size photograph"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset */}
        <img src={dataUri} alt="Enrollee passport photograph" className="size-full object-cover" />
      </button>
    );
  }

  return (
    <div className="flex size-[46px] flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
      {status === "loading" ? <CircleNotch size={19} className="animate-spin" /> : hasPicture ? <ImageIcon size={19} /> : <UserCircleDashed size={19} />}
    </div>
  );
}
