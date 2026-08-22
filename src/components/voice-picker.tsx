"use client";

import { Check } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const GENDER_LABEL: Record<string, string> = {
  male: "M",
  female: "F",
  neutral: "N",
};

/** Grid of voice chips; independent of presenters so any voice fits any face. */
export function VoicePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string | undefined;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const voices = api.voice.list.useQuery();
  if (!voices.data) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {voices.data.map((v) => {
        const selected = v.id === value;
        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v.id)}
            className={cn(
              "focus-visible:ring-ring/50 relative flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-all focus-visible:ring-3 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "border-primary ring-primary/30 bg-primary/5 ring-2"
                : "hover:border-foreground/30",
            )}
          >
            <span className="flex items-center gap-1.5 text-sm leading-tight font-medium">
              {v.label}
              <span className="text-muted-foreground rounded border px-1 text-[10px] leading-4">
                {GENDER_LABEL[v.gender] ?? v.gender}
              </span>
            </span>
            <span className="text-muted-foreground line-clamp-1 text-[11px]">
              {v.description}
            </span>
            {selected && (
              <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full">
                <Check className="size-2.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
