"use client";

import { AlertCircle, Plus, RefreshCw, Rss, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { timeAgo } from "~/lib/format";
import { api } from "~/trpc/react";

export function SourcesSheet() {
  const [open, setOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const utils = api.useUtils();
  const sources = api.source.list.useQuery();

  const invalidate = () => {
    void utils.source.list.invalidate();
    void utils.article.feed.invalidate();
  };
  const add = api.source.add.useMutation({
    onSuccess: (s) => {
      toast.success(`Added ${s.name}`);
      setFeedUrl("");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = api.source.remove.useMutation({
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });
  const refresh = api.source.refresh.useMutation({
    onSuccess: (r) => {
      toast.success(`${r.created} new article${r.created === 1 ? "" : "s"}`);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Rss data-icon="inline-start" /> Sources
        {sources.data && (
          <span className="text-muted-foreground ml-1 text-xs">
            ({sources.data.length})
          </span>
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>RSS sources</SheetTitle>
            <SheetDescription>
              Feeds are polled daily, on page load when stale, and on demand.
            </SheetDescription>
          </SheetHeader>

          <form
            className="space-y-2 border-b px-4 pb-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (feedUrl.trim()) add.mutate({ feedUrl: feedUrl.trim() });
            }}
          >
            <Label htmlFor="feedUrl">Add a feed</Label>
            <div className="flex gap-2">
              <Input
                id="feedUrl"
                type="url"
                placeholder="https://example.com/rss.xml"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                required
              />
              <Button type="submit" disabled={add.isPending}>
                <Plus
                  data-icon="inline-start"
                  className={add.isPending ? "animate-spin" : ""}
                />{" "}
                Add
              </Button>
            </div>
          </form>

          <ul className="flex-1 divide-y overflow-y-auto">
            {sources.data?.map((s) => (
              <li key={s.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.name}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {s.feedUrl}
                  </div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    <span>{s._count.articles} articles</span>
                    <span>·</span>
                    <span>
                      {s.lastPolledAt
                        ? `polled ${timeAgo(s.lastPolledAt)}`
                        : "never polled"}
                    </span>
                    {s.lastError && (
                      <span
                        className="text-destructive inline-flex items-center gap-1"
                        title={s.lastError}
                      >
                        <AlertCircle className="size-3" /> error
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => refresh.mutate({ id: s.id })}
                  disabled={refresh.isPending}
                  aria-label="Refresh"
                >
                  <RefreshCw
                    className={
                      refresh.isPending && refresh.variables?.id === s.id
                        ? "animate-spin"
                        : ""
                    }
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    confirm(`Remove ${s.name} and its articles?`) &&
                    remove.mutate({ id: s.id })
                  }
                  aria-label="Remove"
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </>
  );
}
