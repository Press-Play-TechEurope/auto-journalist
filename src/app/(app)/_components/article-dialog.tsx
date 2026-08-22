"use client";

import { Clapperboard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PresenterPicker } from "~/components/presenter-picker";
import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { hostname, timeAgo } from "~/lib/format";
import { api, type RouterOutputs } from "~/trpc/react";

type FeedArticle = RouterOutputs["article"]["feed"]["items"][number];

export function ArticleDialog({
  article,
  onClose,
}: {
  article: FeedArticle | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const config = api.config.get.useQuery();
  const [presenterId, setPresenterId] = useState<string | undefined>();

  useEffect(() => {
    if (article) setPresenterId(config.data?.defaultPresenterId ?? undefined);
  }, [article, config.data?.defaultPresenterId]);

  const start = api.media.start.useMutation({
    onSuccess: (item) => {
      toast.success("Generation started");
      onClose();
      router.push(`/library/${item.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const existing = article?.mediaItems[0];

  return (
    <Dialog open={!!article} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {article && (
          <>
            <DialogHeader>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span className="text-foreground/80 font-medium">
                  {article.source.name}
                </span>
                <span>·</span>
                <span>{timeAgo(article.publishedAt)}</span>
                <span>·</span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  {hostname(article.url)} <ExternalLink className="size-3" />
                </a>
              </div>
              <DialogTitle className="text-lg leading-snug">
                {article.title}
              </DialogTitle>
              {article.summary && (
                <DialogDescription className="text-sm">
                  {article.summary}
                </DialogDescription>
              )}
            </DialogHeader>

            {article.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.imageUrl}
                alt=""
                className="max-h-64 w-full rounded-xl border object-cover"
              />
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Presenter</p>
              <PresenterPicker value={presenterId} onChange={setPresenterId} />
            </div>

            <DialogFooter className="items-center">
              {existing && (
                <Link
                  href={`/library/${existing.id}`}
                  className="text-muted-foreground mr-auto inline-flex items-center gap-2 text-sm hover:underline"
                >
                  <StatusBadge status={existing.status} /> Open existing video
                </Link>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  start.mutate({ articleId: article.id, presenterId })
                }
                disabled={start.isPending || !presenterId}
              >
                {start.isPending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Clapperboard data-icon="inline-start" />
                )}
                {existing ? "Generate another video" : "Generate video"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
