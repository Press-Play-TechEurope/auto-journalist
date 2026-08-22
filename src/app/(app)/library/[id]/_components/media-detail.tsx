"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Camera,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  AtSign,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  isTerminal,
  STATUS_LABEL,
  StatusBadge,
  STEPS,
} from "~/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { usePipelineDriver } from "~/hooks/use-pipeline";
import { hostname, timeAgo, wordCount } from "~/lib/format";
import { cn } from "~/lib/utils";
import { voiceLabel } from "~/server/voices";
import { api, type RouterOutputs } from "~/trpc/react";
import { type Platform } from "../../../../../../generated/prisma";

type Item = RouterOutputs["media"]["byId"];
type Publication = Item["publications"][number];

const PLATFORM_META: Record<Platform, { label: string; icon: typeof AtSign }> =
  {
    X: { label: "X", icon: AtSign },
    INSTAGRAM: { label: "Instagram", icon: Camera },
  };

export function MediaDetail({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const query = api.media.byId.useQuery({ id });
  const item = query.data;
  usePipelineDriver(item);

  const [script, setScript] = useState("");
  const [caption, setCaption] = useState("");
  const [successPub, setSuccessPub] = useState<Publication | null>(null);

  // Sync editors when server copy changes (e.g. after scripting finishes).
  useEffect(() => {
    if (item?.script != null) setScript(item.script);
  }, [item?.script]);
  useEffect(() => {
    if (item?.caption != null) setCaption(item.caption);
  }, [item?.caption]);

  const refetch = () => {
    void utils.media.byId.invalidate({ id });
    void utils.media.list.invalidate();
  };
  const save = api.media.updateCopy.useMutation({
    onSuccess: () => {
      toast.success("Saved");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });
  const regenerate = api.media.regenerate.useMutation({
    onSuccess: (data) => {
      utils.media.byId.setData({ id }, data);
      toast.success("Re-recording with the edited script…");
    },
    onError: (e) => toast.error(e.message),
  });
  const retry = api.media.retry.useMutation({
    onSuccess: (data) => utils.media.byId.setData({ id }, data),
    onError: (e) => toast.error(e.message),
  });
  const remove = api.media.remove.useMutation({
    onSuccess: () => {
      toast.success("Deleted");
      void utils.media.list.invalidate();
      router.push("/library");
    },
    onError: (e) => toast.error(e.message),
  });
  const publish = api.publish.post.useMutation({
    onSuccess: (pub) => {
      setSuccessPub(pub);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  if (query.isLoading || !item) {
    return (
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Skeleton className="aspect-[3/4] rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-40" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const scriptDirty = script !== (item.script ?? "");
  const captionDirty = caption !== (item.caption ?? "");
  const busy = !isTerminal(item.status);
  const publishedOn = new Set(item.publications.map((p) => p.platform));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/library" />}
          nativeButton={false}
        >
          <ArrowLeft data-icon="inline-start" /> Library
        </Button>
        <StatusBadge status={item.status} />
        <span className="text-muted-foreground text-sm">
          {item.presenter.name} · {voiceLabel(item.voiceId)} · created{" "}
          {timeAgo(item.createdAt)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive ml-auto"
          onClick={() => confirm("Delete this video?") && remove.mutate({ id })}
        >
          <Trash2 data-icon="inline-start" /> Delete
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left: video */}
        <div className="mx-auto w-full max-w-[360px] space-y-4 lg:mx-0">
          <div className="relative overflow-hidden rounded-2xl border bg-black shadow-lg">
            {item.videoUrl ? (
              <video
                src={item.videoUrl}
                controls
                playsInline
                className="aspect-[3/4] w-full object-contain"
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.presenter.imageUrl}
                  alt={item.presenter.name}
                  className={cn(
                    "aspect-[3/4] w-full object-cover",
                    item.status === "FAILED" ? "grayscale" : "opacity-60",
                  )}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/30 text-white backdrop-blur-[2px]">
                  {busy ? (
                    <>
                      <Loader2 className="text-primary-foreground size-8 animate-spin drop-shadow" />
                      <span className="text-sm font-medium drop-shadow">
                        {STATUS_LABEL[item.status]}…
                      </span>
                    </>
                  ) : (
                    <AlertCircle className="size-8" />
                  )}
                </div>
              </>
            )}
          </div>

          <Stepper status={item.status} />

          {item.audioUrl && (
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">
                Voice track
              </Label>
              <audio src={item.audioUrl} controls className="w-full" />
            </div>
          )}

          {item.status === "FAILED" && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Generation failed</AlertTitle>
              <AlertDescription className="break-words">
                {item.error ?? "Unknown error"}
              </AlertDescription>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => retry.mutate({ id })}
                disabled={retry.isPending}
              >
                <RotateCcw data-icon="inline-start" /> Retry
              </Button>
            </Alert>
          )}
        </div>

        {/* Right: article, script, caption, publish */}
        <div className="space-y-5">
          <div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="text-foreground/80 font-medium">
                {item.article.source.name}
              </span>
              <span>·</span>
              <span>{timeAgo(item.article.publishedAt)}</span>
              <span>·</span>
              <a
                href={item.article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline"
              >
                {hostname(item.article.url)} <ExternalLink className="size-3" />
              </a>
            </div>
            <h1 className="font-display mt-1 text-2xl leading-snug font-semibold tracking-tight">
              {item.article.title}
            </h1>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Script</CardTitle>
              <span className="text-muted-foreground text-xs">
                {wordCount(script)} words
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.script == null ? (
                busy ? (
                  <Skeleton className="h-32" />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    The script will appear here once it has been written.
                  </p>
                )
              ) : (
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={9}
                  className="resize-y leading-relaxed"
                  disabled={busy}
                />
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => save.mutate({ id, script })}
                  disabled={!scriptDirty || busy || save.isPending}
                >
                  <Save data-icon="inline-start" /> Save script
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    regenerate.mutate({
                      id,
                      script,
                      caption: captionDirty ? caption : undefined,
                    })
                  }
                  disabled={
                    busy || regenerate.isPending || wordCount(script) < 3
                  }
                >
                  <RefreshCw
                    data-icon="inline-start"
                    className={regenerate.isPending ? "animate-spin" : ""}
                  />
                  {scriptDirty
                    ? "Regenerate video with edited script"
                    : "Regenerate video"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Post caption</CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  void navigator.clipboard.writeText(caption);
                  toast.success("Caption copied");
                }}
                disabled={!caption}
              >
                <Copy data-icon="inline-start" /> Copy
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.caption == null ? (
                busy ? (
                  <Skeleton className="h-20" />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    A caption is generated together with the script.
                  </p>
                )
              ) : (
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="resize-y"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => save.mutate({ id, caption })}
                disabled={!captionDirty || save.isPending}
              >
                <Save data-icon="inline-start" /> Save caption
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PLATFORM_META) as Platform[]).map((platform) => {
                  const { label, icon: Icon } = PLATFORM_META[platform];
                  const done = publishedOn.has(platform);
                  const pending =
                    publish.isPending &&
                    publish.variables?.platform === platform;
                  return (
                    <Button
                      key={platform}
                      variant={done ? "secondary" : "default"}
                      onClick={() =>
                        publish.mutate({ mediaItemId: id, platform })
                      }
                      disabled={item.status !== "READY" || publish.isPending}
                    >
                      {pending ? (
                        <Loader2
                          data-icon="inline-start"
                          className="animate-spin"
                        />
                      ) : done ? (
                        <Check data-icon="inline-start" />
                      ) : (
                        <Icon data-icon="inline-start" />
                      )}
                      {done
                        ? `Posted to ${label} · post again`
                        : `Post to ${label}`}
                    </Button>
                  );
                })}
              </div>
              {item.status !== "READY" && (
                <p className="text-muted-foreground text-xs">
                  Publishing unlocks once the video is ready.
                </p>
              )}
              {item.publications.length > 0 && (
                <>
                  <Separator />
                  <ul className="space-y-1 text-sm">
                    {item.publications.map((p) => (
                      <li key={p.id} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{PLATFORM_META[p.platform].label}</span>
                        <span className="text-muted-foreground">
                          · {timeAgo(p.postedAt)}
                        </span>
                        {p.externalUrl && (
                          <span className="text-muted-foreground ml-auto truncate text-xs">
                            {p.externalUrl}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PublishSuccessDialog
        publication={successPub}
        videoUrl={item.videoUrl}
        caption={item.caption}
        onClose={() => setSuccessPub(null)}
      />
    </div>
  );
}

function Stepper({ status }: { status: Item["status"] }) {
  const current =
    status === "QUEUED" ? 0 : status === "FAILED" ? -1 : STEPS.indexOf(status);
  return (
    <ol className="flex items-center gap-1">
      {STEPS.map((step, i) => {
        const done = status === "READY" || (current > i && current !== -1);
        const active = current === i && status !== "READY";
        return (
          <li key={step} className="flex flex-1 flex-col gap-1">
            <div
              className={cn(
                "h-1.5 rounded-full",
                done
                  ? "bg-emerald-500"
                  : active
                    ? "bg-primary animate-pulse"
                    : "bg-muted",
              )}
            />
            <span
              className={cn(
                "truncate text-[10px]",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function PublishSuccessDialog({
  publication,
  videoUrl,
  caption,
  onClose,
}: {
  publication: Publication | null;
  videoUrl: string | null;
  caption: string | null;
  onClose: () => void;
}) {
  const meta = publication ? PLATFORM_META[publication.platform] : null;
  return (
    <Dialog open={!!publication} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        {publication && meta && (
          <>
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="size-7" />
              </div>
              <DialogTitle className="text-center">
                Posted to {meta.label}
              </DialogTitle>
              <DialogDescription className="text-center">
                Your video is live. Here&apos;s a preview of the post.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden rounded-lg border">
              {videoUrl && (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="aspect-[3/4] w-full bg-black object-contain"
                />
              )}
              {caption && (
                <p className="p-3 text-sm whitespace-pre-wrap">{caption}</p>
              )}
            </div>
            {publication.externalUrl && (
              <p className="text-muted-foreground truncate text-center text-xs">
                {publication.externalUrl}
              </p>
            )}
            <DialogFooter>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
