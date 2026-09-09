import { cn } from "@/lib/utils";
import { avatarFor, initialsOf, statusTone } from "@/lib/mock-data";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-medium",
        className,
      )}
      style={{ background: tone.bg, color: tone.fg, borderColor: tone.bd }}
    >
      {status}
    </span>
  );
}

export function InitialsAvatar({
  first,
  last,
  seed,
  size = 34,
  className,
}: {
  first: string;
  last: string;
  seed?: string;
  size?: number;
  className?: string;
}) {
  const tone = avatarFor(seed ?? first + last);
  return (
    <div
      aria-hidden
      className={cn("flex flex-none items-center justify-center rounded-full font-semibold", className)}
      style={{ width: size, height: size, background: tone.bg, color: tone.fg, fontSize: size * 0.34 }}
    >
      {initialsOf(first, last)}
    </div>
  );
}
