import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { type MediaStatus } from "../../generated/prisma";

export const STATUS_LABEL: Record<MediaStatus, string> = {
  QUEUED: "Queued",
  ENRICHING: "Reading article",
  SCRIPTING: "Writing script",
  GENERATING_AUDIO: "Recording voice",
  GENERATING_VIDEO: "Rendering video",
  READY: "Ready",
  FAILED: "Failed",
};

export const STEPS: MediaStatus[] = [
  "ENRICHING",
  "SCRIPTING",
  "GENERATING_AUDIO",
  "GENERATING_VIDEO",
  "READY",
];

export function isTerminal(s: MediaStatus) {
  return s === "READY" || s === "FAILED";
}

export function StatusBadge({
  status,
  className,
}: {
  status: MediaStatus;
  className?: string;
}) {
  if (status === "READY")
    return (
      <Badge
        className={cn(
          "gap-1 bg-emerald-600 text-white hover:bg-emerald-600",
          className,
        )}
      >
        <CheckCircle2 className="size-3" /> Ready
      </Badge>
    );
  if (status === "FAILED")
    return (
      <Badge
        className={cn(
          "bg-destructive hover:bg-destructive gap-1 text-white",
          className,
        )}
      >
        <XCircle className="size-3" /> Failed
      </Badge>
    );
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <Loader2 className="size-3 animate-spin" /> {STATUS_LABEL[status]}
    </Badge>
  );
}
