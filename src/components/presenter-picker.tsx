"use client";

import { Check } from "lucide-react";

import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { voiceLabel } from "~/server/voices";
import { api } from "~/trpc/react";

export function PresenterPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string | undefined;
  onChange: (id: string) => void;
  compact?: boolean;
}) {
  const presenters = api.presenter.list.useQuery();
  if (!presenters.data) {
    return (
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4",
      )}
    >
      {presenters.data.map((p) => {
        const selected = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={cn(
              "group focus-visible:ring-ring/50 relative overflow-hidden rounded-lg border text-left transition-all focus-visible:ring-3 focus-visible:outline-none",
              selected
                ? "border-primary ring-primary/30 ring-2"
                : "hover:border-foreground/30",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt={p.name}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
              <div className="text-sm leading-tight font-medium">{p.name}</div>
              {!compact && (
                <div className="text-[11px] opacity-80">
                  {voiceLabel(p.voiceId)}
                </div>
              )}
            </div>
            {selected && (
              <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full">
                <Check className="size-3" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
