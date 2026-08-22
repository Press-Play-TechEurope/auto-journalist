"use client";

import {
  Clapperboard,
  ExternalLink,
  Folder,
  FolderOpen,
  RefreshCw,
  Rss,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "~/components/ui/combobox";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useStar } from "~/hooks/use-star";
import { hostname, timeAgo } from "~/lib/format";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

import { ArticleDialog } from "./article-dialog";
import { SourcesSheet } from "./sources-sheet";

type FeedArticle = RouterOutputs["article"]["feed"]["items"][number];
type SourceRow = RouterOutputs["source"]["list"][number];

export function Feed() {
  const utils = api.useUtils();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [sourceId, setSourceId] = useState<string | undefined>();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selected, setSelected] = useState<FeedArticle | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  const sources = api.source.list.useQuery();
  const folders = api.folder.list.useQuery();
  const starredCount = api.article.starredCount.useQuery();
  const star = useStar();
  const feed = api.article.feed.useInfiniteQuery(
    { folderId, sourceId, q: debouncedQ || undefined },
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
  // Prefer the live row (star state etc.) over the snapshot taken on click.
  const selectedLive = selected
    ? (items.find((a) => a.id === selected.id) ?? selected)
    : null;

  const isStarredView = folderId === "starred";
  const hasFolders = (folders.data?.length ?? 0) > 0;
  const showTabs = hasFolders || (starredCount.data ?? 0) > 0;
  const unfiledCount = sources.data?.filter((s) => !s.folderId).length ?? 0;
  // Source tabs are scoped to the selected folder ("Starred" spans them all).
  const visibleSources =
    sources.data?.filter((s) =>
      !folderId || isStarredView
        ? true
        : folderId === "unfiled"
          ? !s.folderId
          : s.folderId === folderId,
    ) ?? [];

  const selectFolder = (v: string) => {
    setFolderId(v === "all" ? undefined : v);
    setSourceId(undefined);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
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

      <div className="flex flex-wrap items-center gap-2">
        {showTabs && (
          <Tabs
            value={folderId ?? "all"}
            onValueChange={(v) => selectFolder(String(v))}
          >
            <TabsList className="flex-wrap justify-start">
              <TabsTrigger value="all">
                <FolderOpen data-icon="inline-start" />{" "}
                {hasFolders ? "All folders" : "All"}
              </TabsTrigger>
              <TabsTrigger value="starred">
                <Star
                  data-icon="inline-start"
                  className="fill-amber-400 text-amber-400"
                />{" "}
                Starred
                <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                  {starredCount.data ?? 0}
                </span>
              </TabsTrigger>
              {folders.data?.map((f) => (
                <TabsTrigger key={f.id} value={f.id}>
                  <Folder data-icon="inline-start" /> {f.name}
                  <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                    {f._count.sources}
                  </span>
                </TabsTrigger>
              ))}
              {unfiledCount > 0 && (
                <TabsTrigger value="unfiled">
                  Unfiled
                  <span className="text-muted-foreground ml-1 text-xs tabular-nums">
                    {unfiledCount}
                  </span>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        )}
        <SourcePicker
          sources={visibleSources}
          value={sourceId}
          onChange={setSourceId}
          scopedToFolder={Boolean(folderId) && !isStarredView}
        />
      </div>

      {feed.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 && isStarredView ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-400/15 text-amber-500">
            <Star className="size-6" />
          </div>
          <p className="text-muted-foreground text-sm">
            {debouncedQ || sourceId
              ? "No starred articles match."
              : "Nothing starred yet — hit the star on any article to save it here."}
          </p>
          <Button variant="outline" onClick={() => selectFolder("all")}>
            <FolderOpen data-icon="inline-start" /> Browse all articles
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Rss className="size-6" />
          </div>
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
                onToggleStar={() => star.toggle(a)}
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

      <ArticleDialog
        article={selectedLive}
        onClose={() => setSelected(null)}
        onToggleStar={() => selectedLive && star.toggle(selectedLive)}
      />
    </div>
  );
}

/** Searchable "All sources ▾" dropdown — scales to any number of feeds. */
function SourcePicker({
  sources,
  value,
  onChange,
  scopedToFolder,
}: {
  sources: SourceRow[];
  value: string | undefined;
  onChange: (id: string | undefined) => void;
  scopedToFolder: boolean;
}) {
  const items = [...sources].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  const selected = items.find((s) => s.id === value) ?? null;
  const placeholder = scopedToFolder ? "All in folder" : "All sources";
  return (
    <div className="flex items-center gap-1">
      <Combobox
        items={items}
        value={selected}
        onValueChange={(v) => onChange(v?.id)}
        itemToStringLabel={(s: SourceRow) => s.name}
        isItemEqualToValue={(a: SourceRow, b: SourceRow) => a.id === b.id}
      >
        <ComboboxTrigger className="max-w-72" aria-label="Filter by source">
          <Rss className="text-muted-foreground" />
          <ComboboxValue placeholder={placeholder}>
            {(s: SourceRow | null) => (
              <span className="truncate">{s ? s.name : placeholder}</span>
            )}
          </ComboboxValue>
        </ComboboxTrigger>
        <ComboboxContent className="w-80">
          <ComboboxInput placeholder="Search feeds…" autoFocus />
          <ComboboxEmpty>No feeds match.</ComboboxEmpty>
          <ComboboxList>
            {(s: SourceRow) => (
              <ComboboxItem key={s.id} value={s}>
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {s._count.articles}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
        {selected && <ComboboxClear aria-label="Clear source filter" />}
      </Combobox>
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
  onToggleStar,
}: {
  article: FeedArticle;
  onClick: () => void;
  onToggleStar: () => void;
}) {
  const latest = article.mediaItems[0];
  const starred = Boolean(article.starredAt);
  // The star is a sibling of the card <button> (not a child) so the markup
  // stays valid and clicking it never opens the dialog.
  return (
    <div className="group relative flex">
      <StarButton
        starred={starred}
        onClick={onToggleStar}
        className={cn(
          "absolute top-2 left-2 z-10 transition-opacity",
          !starred &&
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
      />
      <button
        type="button"
        onClick={onClick}
        className="bg-card border-border/60 focus-visible:ring-ring/50 flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:outline-none"
      >
        <div className="from-primary/15 via-muted to-muted relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br">
          {article.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="text-primary/50 flex size-full items-center justify-center">
              <Rss className="size-7" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
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
    </div>
  );
}

/** Round star toggle used on cards and in the article dialog. */
export function StarButton({
  starred,
  onClick,
  className,
}: {
  starred: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={starred}
      aria-label={starred ? "Unstar article" : "Star article"}
      title={starred ? "Unstar" : "Star"}
      className={cn(
        "focus-visible:ring-ring/50 inline-flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-sm backdrop-blur-sm hover:bg-black/60 focus-visible:ring-3 focus-visible:outline-none",
        className,
      )}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          starred && "fill-amber-400 text-amber-400",
        )}
      />
    </button>
  );
}
