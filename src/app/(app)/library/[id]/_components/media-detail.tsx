"use client";

import {
  AlertCircle,
  ArrowLeft,
  Captions,
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

import { PresenterPicker } from "~/components/presenter-picker";
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
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { VoicePicker } from "~/components/voice-picker";
import { usePipelineDriver } from "~/hooks/use-pipeline";
import { hostname, timeAgo, wordCount } from "~/lib/format";
import { cn } from "~/lib/utils";
import { providerForModel, resolveVoiceFor, voiceLabel } from "~/server/voices";
import { api, type RouterOutputs } from "~/trpc/react";
import { type Platform } from "../../../../../../generated/prisma";

type Item = RouterOutputs["media"]["byId"];
type Publication = Item["publications"][number];

const PLATFORM_META: Record<
  Platform,
  { label: string; icon: typeof AtSign; buttonClass: string }
> = {
  X: {
    label: "X",
    icon: AtSign,
    buttonClass:
      "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
  },
  INSTAGRAM: {
    label: "Instagram",
    icon: Camera,
    buttonClass:
      "bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] text-white hover:opacity-90",
  },
};

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function MediaDetail({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const query = api.media.byId.useQuery({ id });
  const config = api.config.get.useQuery();
  const item = query.data;
  usePipelineDriver(item);

  const [script, setScript] = useState("");
  const [caption, setCaption] = useState("");
  const [presenterId, setPresenterId] = useState<string | undefined>();
  const [voiceId, setVoiceId] = useState<string | undefined>();
  const [successPub, setSuccessPub] = useState<Publication | null>(null);
  const [confirmPlatform, setConfirmPlatform] = useState<Platform | null>(null);

  // Sync editors when server copy changes (e.g. after scripting finishes).
  useEffect(() => {
    if (item?.script != null) setScript(item.script);
  }, [item?.script]);
  useEffect(() => {
    if (item?.caption != null) setCaption(item.caption);
  }, [item?.caption]);
  // Re-record pickers follow the item; a voice from another provider (e.g. a
  // legacy id) falls back to the current provider's default.
  useEffect(() => {
    if (item) setPresenterId(item.presenterId);
  }, [item?.presenterId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!item || !config.data) return;
    setVoiceId(resolveVoiceFor(config.data.ttsModel, item.voiceId));
  }, [item?.voiceId, config.data?.ttsModel]); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.success("Re-recording…");
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
      setConfirmPlatform(null);
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
  const castDirty =
    (presenterId != null && presenterId !== item.presenterId) ||
    (voiceId != null && voiceId !== item.voiceId);
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
            {item.subtitledVideoUrl ?? item.videoUrl ? (
              <video
                src={item.subtitledVideoUrl ?? item.videoUrl ?? undefined}
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

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PLATFORM_META) as Platform[]).map((platform) => {
              const { label, icon: Icon, buttonClass } =
                PLATFORM_META[platform];
              const done = publishedOn.has(platform);
              const pending =
                publish.isPending && publish.variables?.platform === platform;
              return (
                <Button
                  key={platform}
                  size="lg"
                  className={cn(buttonClass, "font-semibold")}
                  onClick={() => setConfirmPlatform(platform)}
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
                  {done ? `Post again` : `Post to ${label}`}
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
          )}

          <Stepper status={item.status} />

          {item.subtitledVideoUrl && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Captions className="size-3.5" /> Subtitles burned in
            </div>
          )}

          {item.videoUrl && item.subtitledVideoUrl && (
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">
                No-subtitles version
              </Label>
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
              >
                <ExternalLink className="size-3" /> Open original MP4
              </a>
            </div>
          )}

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => save.mutate({ id, script })}
                disabled={!scriptDirty || busy || save.isPending}
              >
                <Save data-icon="inline-start" /> Save script
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Re-record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">
                  Presenter
                </Label>
                <PresenterPicker
                  compact
                  value={presenterId}
                  onChange={setPresenterId}
                  disabled={busy}
                />
              </div>
              {config.data && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">Voice</Label>
                  <VoicePicker
                    value={voiceId}
                    onChange={setVoiceId}
                    provider={providerForModel(config.data.ttsModel)}
                    disabled={busy}
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={() =>
                  regenerate.mutate({
                    id,
                    script,
                    caption: captionDirty ? caption : undefined,
                    presenterId,
                    voiceId,
                  })
                }
                disabled={
                  busy ||
                  regenerate.isPending ||
                  wordCount(script) < 3 ||
                  !presenterId ||
                  !voiceId
                }
              >
                <RefreshCw
                  data-icon="inline-start"
                  className={regenerate.isPending ? "animate-spin" : ""}
                />
                {scriptDirty && castDirty
                  ? "Regenerate with edited script & new cast"
                  : scriptDirty
                    ? "Regenerate video with edited script"
                    : castDirty
                      ? "Regenerate video with new cast"
                      : "Regenerate video"}
              </Button>
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

        </div>
      </div>

      <PublishConfirmDialog
        platform={confirmPlatform}
        videoUrl={item.subtitledVideoUrl ?? item.videoUrl}
        caption={caption}
        pending={publish.isPending}
        onConfirm={() =>
          confirmPlatform &&
          publish.mutate({ mediaItemId: id, platform: confirmPlatform })
        }
        onClose={() => setConfirmPlatform(null)}
      />

      <PublishSuccessDialog
        publication={successPub}
        videoUrl={item.subtitledVideoUrl ?? item.videoUrl}
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

function PublishConfirmDialog({
  platform,
  videoUrl,
  caption,
  pending,
  onConfirm,
  onClose,
}: {
  platform: Platform | null;
  videoUrl: string | null;
  caption: string;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isX = platform === "X";
  return (
    <Dialog open={!!platform} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "sm:max-w-md",
          isX
            ? "border border-zinc-800 bg-black text-white ring-zinc-800"
            : "gap-0 overflow-hidden p-0",
        )}
      >
        {platform && (
          <>
            {isX ? (
              <DialogHeader className="flex-row items-center gap-3">
                <XLogo className="size-5" />
                <DialogTitle>Post to X</DialogTitle>
              </DialogHeader>
            ) : (
              <>
                <div className="h-1.5 bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737]" />
                <DialogHeader className="flex-row items-center gap-3 p-4 pb-0">
                  <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#f77737] via-[#e1306c] to-[#833ab4] text-white">
                    <Camera className="size-4" />
                  </span>
                  <DialogTitle>Share to Instagram</DialogTitle>
                </DialogHeader>
              </>
            )}

            <div
              className={cn(
                "overflow-hidden rounded-xl",
                isX ? "border border-zinc-800" : "mx-4 mt-4 border",
              )}
            >
              {videoUrl && (
                <video
                  src={videoUrl}
                  controls
                  muted
                  playsInline
                  className="aspect-[3/4] max-h-72 w-full bg-black object-contain"
                />
              )}
              {caption && (
                <p
                  className={cn(
                    "line-clamp-4 p-3 text-sm whitespace-pre-wrap",
                    isX ? "text-zinc-300" : "text-foreground",
                  )}
                >
                  {caption}
                </p>
              )}
            </div>

            <div
              className={cn(
                "flex justify-end gap-2",
                !isX && "p-4 pt-3",
              )}
            >
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={pending}
                className={cn(
                  isX &&
                    "rounded-full text-zinc-300 hover:bg-zinc-900 hover:text-white",
                )}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={pending}
                className={cn(
                  "font-semibold",
                  isX
                    ? "rounded-full bg-white text-black hover:bg-zinc-200"
                    : "bg-[#0095f6] text-white hover:bg-[#0081d6]",
                )}
              >
                {pending ? (
                  <Loader2
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : isX ? (
                  <XLogo className="size-4" />
                ) : (
                  <Camera data-icon="inline-start" />
                )}
                {pending ? "Posting…" : isX ? "Post" : "Share"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
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
