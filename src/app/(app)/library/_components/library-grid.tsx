"use client";

import { Clapperboard, Play, Send } from "lucide-react";
import Link from "next/link";

import { isTerminal, StatusBadge } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { usePipelineDriver } from "~/hooks/use-pipeline";
import { timeAgo } from "~/lib/format";
import { api, type RouterOutputs } from "~/trpc/react";

type Item = RouterOutputs["media"]["list"][number];

export function LibraryGrid() {
  const list = api.media.list.useQuery(undefined, { refetchInterval: 10_000 });
  const items = list.data ?? [];
  const active = items.filter((i) => !isTerminal(i.status));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Media library
          </h1>
          <p className="text-muted-foreground text-sm">
            {items.length} video{items.length === 1 ? "" : "s"}
            {active.length > 0 && ` · ${active.length} generating`}
          </p>
        </div>
        <Button
          className="ml-auto"
          variant="outline"
          render={<Link href="/feed" />}
          nativeButton={false}
        >
          <Clapperboard data-icon="inline-start" /> Pick a story
        </Button>
      </div>

      {/* Keep in-flight items moving even when their detail page isn't open. */}
      {active.map((i) => (
        <PipelineDriver key={i.id} item={i} />
      ))}

      {list.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Clapperboard className="size-6" />
          </div>
          <p className="text-muted-foreground text-sm">
            No videos yet. Pick a story from the feed to generate one.
          </p>
          <Button
            variant="outline"
            render={<Link href="/feed" />}
            nativeButton={false}
          >
            Go to feed
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineDriver({
  item,
}: {
  item: { id: string; status: Item["status"] };
}) {
  usePipelineDriver(item);
  return null;
}

function LibraryCard({ item }: { item: Item }) {
  const published = item.publications.length;
  return (
    <Link
      href={`/library/${item.id}`}
      className="group bg-card border-border/60 flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="bg-muted relative aspect-[3/4] overflow-hidden">
        {item.subtitledVideoUrl ?? item.videoUrl ? (
          <video
            src={item.subtitledVideoUrl ?? item.videoUrl ?? undefined}
            className="size-full object-cover"
            muted
            playsInline
            preload="metadata"
            onMouseEnter={(e) =>
              void e.currentTarget.play().catch(() => undefined)
            }
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.presenter.imageUrl}
            alt={item.presenter.name}
            className={`size-full object-cover ${item.status === "FAILED" ? "grayscale" : "opacity-70"}`}
          />
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={item.status} />
        </div>
        {(item.subtitledVideoUrl ?? item.videoUrl) && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="bg-primary/80 flex size-11 items-center justify-center rounded-full text-white shadow-lg backdrop-blur-sm">
              <Play className="ml-0.5 size-5" />
            </span>
          </div>
        )}
        {published > 0 && (
          <Badge className="absolute right-2 bottom-2 gap-1 border-white/20 bg-black/60 text-white backdrop-blur-sm hover:bg-black/60">
            <Send className="size-3" /> {published}
          </Badge>
        )}
      </div>
      <div className="space-y-1 p-3">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{item.presenter.name}</span>
          <span>·</span>
          <span>{timeAgo(item.createdAt)}</span>
        </div>
        <h3 className="line-clamp-2 text-sm leading-snug font-medium">
          {item.article.title}
        </h3>
        <p className="text-muted-foreground text-xs">
          {item.article.source.name}
        </p>
      </div>
    </Link>
  );
}
