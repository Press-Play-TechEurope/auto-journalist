"use client";

import {
  Clapperboard,
  ExternalLink,
  RefreshCw,
  Rss,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { hostname, timeAgo } from "~/lib/format";
import { api, type RouterOutputs } from "~/trpc/react";

import { ArticleDialog } from "./article-dialog";
import { SourcesSheet } from "./sources-sheet";

type FeedArticle = RouterOutputs["article"]["feed"]["items"][number];

export function Feed() {
  const utils = api.useUtils();
  const [sourceId, setSourceId] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selected, setSelected] = useState<FeedArticle | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const sources = api.source.list.useQuery();
  const feed = api.article.feed.useInfiniteQuery(
    { sourceId, q: debouncedQ || undefined },
    { getNextPageParam: (last) => last.nextCursor },
  );

  const refresh = api.source.refresh.useMutation({
    onSuccess: (r, vars) => {
      void utils.article.feed.invalidate();
      void utils.source.list.invalidate();
      if (!vars?.staleMinutes)
        toast.success(
          `Polled ${r.polled} feed${r.polled === 1 ? "" : "s"} · ${r.created} new`,
        );
    },
    onError: (e) => toast.error(e.message),
  });

  // Refresh stale feeds on first load.
  const { mutate: refreshMutate } = refresh;
  useEffect(() => {
    refreshMutate({ staleMinutes: 30 });
  }, [refreshMutate]);

  const items = feed.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Newsroom feed
          </h1>
          <p className="text-muted-foreground text-sm">
            Pick a story to turn into a presenter video.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search headlines…"
              className="w-56 pl-8"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refresh.mutate({})}
            disabled={refresh.isPending}
          >
            <RefreshCw
              data-icon="inline-start"
              className={refresh.isPending ? "animate-spin" : ""}
            />
            Refresh
          </Button>
          <SourcesSheet />
        </div>
      </div>

      <Tabs
        value={sourceId ?? "all"}
        onValueChange={(v) => setSourceId(v === "all" ? undefined : String(v))}
      >
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="all">All sources</TabsTrigger>
          {sources.data?.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {feed.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <Rss className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">
            {sources.data?.length
              ? "No articles yet — try refreshing."
              : "Add an RSS source to get started."}
          </p>
          <Button
            variant="outline"
            onClick={() => refresh.mutate({})}
            disabled={refresh.isPending}
          >
            <RefreshCw data-icon="inline-start" /> Refresh feeds
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <ArticleCard
                key={a.id}
                article={a}
                onClick={() => setSelected(a)}
              />
            ))}
          </div>
          {feed.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => feed.fetchNextPage()}
                disabled={feed.isFetchingNextPage}
              >
                {feed.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}

      <ArticleDialog article={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
}: {
  article: FeedArticle;
  onClick: () => void;
}) {
  const latest = article.mediaItems[0];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group bg-card focus-visible:ring-ring/50 flex flex-col overflow-hidden rounded-xl border text-left transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:outline-none"
    >
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <Rss className="size-6" />
          </div>
        )}
        {latest && (
          <div className="absolute top-2 right-2">
            <StatusBadge status={latest.status} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="text-foreground/80 font-medium">
            {article.source.name}
          </span>
          <span>·</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="line-clamp-2 leading-snug font-medium">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {article.summary}
          </p>
        )}
        <div className="text-muted-foreground mt-auto flex items-center gap-2 pt-1 text-xs">
          <span className="truncate">{hostname(article.url)}</span>
          {latest ? (
            <Link
              href={`/library/${latest.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary ml-auto inline-flex items-center gap-1 hover:underline"
            >
              <Clapperboard className="size-3.5" /> Open video
            </Link>
          ) : (
            <span className="ml-auto inline-flex items-center gap-1">
              <ExternalLink className="size-3.5" /> Details
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
