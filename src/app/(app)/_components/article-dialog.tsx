"use client";

import { Clapperboard, ExternalLink, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PresenterPicker } from "~/components/presenter-picker";
import { StatusBadge } from "~/components/status-badge";
import { VoicePicker } from "~/components/voice-picker";
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
import { cn } from "~/lib/utils";
import { providerForModel } from "~/server/voices";
import { api, type RouterOutputs } from "~/trpc/react";

type FeedArticle = RouterOutputs["article"]["feed"]["items"][number];

export function ArticleDialog({
  article,
  onClose,
  onToggleStar,
}: {
  article: FeedArticle | null;
  onClose: () => void;
  /** Star/unstar without generating anything. */
  onToggleStar?: () => void;
}) {
  const router = useRouter();
  const config = api.config.get.useQuery();
  const [presenterId, setPresenterId] = useState<string | undefined>();
  const [voiceId, setVoiceId] = useState<string | undefined>();

  useEffect(() => {
    if (!article) return;
    setPresenterId(config.data?.defaultPresenterId ?? undefined);
    setVoiceId(config.data?.defaultVoiceId);
  }, [article, config.data?.defaultPresenterId, config.data?.defaultVoiceId]);

  const start = api.media.start.useMutation({
    onSuccess: (item) => {
      toast.success("Generation started");
      onClose();
      router.push(`/library/${item.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const existing = article?.mediaItems[0];
  const starred = Boolean(article?.starredAt);

  return (
    <Dialog open={!!article} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col sm:max-w-2xl">
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

            <div className="-mx-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-4">
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
                <PresenterPicker
                  value={presenterId}
                  onChange={setPresenterId}
                />
              </div>

              {config.data && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Voice</p>
                  <VoicePicker
                    value={voiceId}
                    onChange={setVoiceId}
                    provider={providerForModel(config.data.ttsModel)}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="items-center">
              <div className="mr-auto flex flex-wrap items-center gap-3">
                {onToggleStar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleStar}
                    aria-pressed={starred}
                  >
                    <Star
                      data-icon="inline-start"
                      className={cn(starred && "fill-amber-400 text-amber-400")}
                    />
                    {starred ? "Starred" : "Star"}
                  </Button>
                )}
                {existing && (
                  <Link
                    href={`/library/${existing.id}`}
                    className="text-muted-foreground inline-flex items-center gap-2 text-sm hover:underline"
                  >
                    <StatusBadge status={existing.status} /> Open existing video
                  </Link>
                )}
              </div>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  start.mutate({ articleId: article.id, presenterId, voiceId })
                }
                disabled={start.isPending || !presenterId || !voiceId}
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
