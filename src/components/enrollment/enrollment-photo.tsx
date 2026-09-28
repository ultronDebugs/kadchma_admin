"use client";

import { useEffect, useState } from "react";
import { CircleNotch, DownloadSimple, Image as ImageIcon, UserCircleDashed } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EXTENSION_FOR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function extensionForMime(mime: string) {
  return EXTENSION_FOR_MIME[mime] ?? "jpg";
}

export function EnrollmentPhoto({ enrollmentId, hasPicture }: { enrollmentId: string; hasPicture: boolean }) {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(hasPicture ? "loading" : "idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasPicture) return;
    let cancelled = false;
    fetch(`/api/enrollments/${encodeURIComponent(enrollmentId)}/photo`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        if (cancelled) return;
        setMimeType(json.mime_type || "image/jpeg");
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

  function handleDownload() {
    if (!dataUri) return;
    // A data: URI can't be opened via window.open (browsers block top-level
    // navigation to it) — but an <a download> click triggers a real save,
    // which works for any URI scheme including data:.
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = `${enrollmentId}-photo.${extensionForMime(mimeType)}`;
    a.click();
  }

  if (status === "ready" && dataUri) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-[46px] flex-none items-center justify-center overflow-hidden rounded-md border"
          aria-label="Open full-size photograph"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset */}
          <img src={dataUri} alt="Enrollee passport photograph" className="size-full object-cover" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Passport photograph</DialogTitle>
            </DialogHeader>
            {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote/static asset */}
            <img src={dataUri} alt="Enrollee passport photograph" className="max-h-[60vh] w-full rounded-md border object-contain" />
            <Button onClick={handleDownload}>
              <DownloadSimple size={15} />
              <span>Download photo</span>
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex size-[46px] flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
      {status === "loading" ? <CircleNotch size={19} className="animate-spin" /> : hasPicture ? <ImageIcon size={19} /> : <UserCircleDashed size={19} />}
    </div>
  );
}
