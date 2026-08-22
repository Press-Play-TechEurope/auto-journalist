import { type MediaStatus, type Prisma } from "../../generated/prisma";
import { db } from "~/server/db";
import { fetchArticleText } from "~/server/lib/article-fetch";
import {
  checkSubtitles,
  checkTalkingHead,
  submitSubtitles,
  submitTalkingHead,
  synthesizeSpeech,
} from "~/server/lib/fal";
import { generateScript } from "~/server/lib/openai";
import {
  DEFAULT_SUBTITLE_PRESET,
  isSubtitlePreset,
} from "~/server/subtitle-presets";
import {
  DEFAULT_SUBTITLE_LANGUAGE,
  isSubtitleLanguage,
} from "~/server/subtitle-languages";
import { extractArticle } from "~/server/lib/tavily";
import { resolveVoiceFor } from "~/server/voices";

export const TERMINAL: MediaStatus[] = ["READY", "FAILED"];

const include = {
  article: { include: { source: true } },
  presenter: true,
  publications: true,
} satisfies Prisma.MediaItemInclude;

export type MediaItemFull = Prisma.MediaItemGetPayload<{
  include: typeof include;
}>;

export async function getMediaItem(id: string): Promise<MediaItemFull> {
  return db.mediaItem.findUniqueOrThrow({ where: { id }, include });
}

export async function getOrgConfig() {
  return db.orgConfig.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
    include: { defaultPresenter: true },
  });
}

/** Ensure the article has raw content + Tavily extract. Idempotent. */
export async function enrichArticle(articleId: string) {
  const article = await db.article.findUniqueOrThrow({
    where: { id: articleId },
  });
  if (article.enrichedAt) return article;

  const [raw, extract] = await Promise.all([
    fetchArticleText(article.url),
    extractArticle(article.url).catch((err: unknown) => {
      // Tavily is best-effort: fall back to the raw fetch if it fails.
      console.warn("tavily extract failed", err);
      return null;
    }),
  ]);

  if (!raw && !extract)
    throw new Error(
      "Could not fetch article content (HTTP fetch and Tavily both failed)",
    );

  return db.article.update({
    where: { id: articleId },
    data: {
      rawContent: raw,
      extract: extract ?? undefined,
      imageUrl: article.imageUrl ?? extract?.images[0] ?? undefined,
      enrichedAt: new Date(),
    },
  });
}

async function setStatus(
  id: string,
  status: MediaStatus,
  data: Prisma.MediaItemUpdateInput = {},
) {
  return db.mediaItem.update({
    where: { id },
    data: { status, error: null, ...data },
    include,
  });
}

async function fail(id: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`pipeline ${id} failed:`, err);
  return db.mediaItem.update({
    where: { id },
    data: { status: "FAILED", error: message },
    include,
  });
}

/**
 * Advance a media item by exactly one step. Called repeatedly by the client
 * (and safe to call when already terminal). Each step is bounded so it fits
 * inside a single serverless invocation.
 */
export async function advance(id: string): Promise<MediaItemFull> {
  const item = await getMediaItem(id);
  try {
    switch (item.status) {
      case "QUEUED":
      case "ENRICHING": {
        await setStatus(id, "ENRICHING");
        await enrichArticle(item.articleId);
        return setStatus(id, "SCRIPTING");
      }
      case "SCRIPTING": {
        const [config, article] = await Promise.all([
          getOrgConfig(),
          db.article.findUniqueOrThrow({
            where: { id: item.articleId },
            include: { source: true },
          }),
        ]);
        const extract = article.extract as { content?: string } | null;
        const content =
          extract?.content ??
          article.rawContent ??
          article.summary ??
          article.title;
        const out = await generateScript({
          brandName: config.brandName,
          tone: config.tone,
          targetSeconds: config.targetSeconds,
          presenterName: item.presenter.name,
          article: {
            title: article.title,
            url: article.url,
            sourceName: article.source.name,
            publishedAt: article.publishedAt,
            summary: article.summary,
            content,
          },
        });
        return setStatus(id, "GENERATING_AUDIO", {
          script: out.script,
          caption: out.caption,
        });
      }
      case "GENERATING_AUDIO": {
        if (!item.script) throw new Error("No script to synthesize");
        const config = await getOrgConfig();
        const { audioUrl } = await synthesizeSpeech({
          model: config.ttsModel,
          text: item.script,
          voiceId: item.voiceId,
        });
        const requestId = await submitTalkingHead({
          imageUrl: item.presenter.imageUrl,
          audioUrl,
        });
        return setStatus(id, "GENERATING_VIDEO", {
          audioUrl,
          falRequestId: requestId,
        });
      }
      case "GENERATING_VIDEO": {
        if (!item.falRequestId) throw new Error("Missing fal request id");
        const st = await checkTalkingHead(item.falRequestId);
        if (st.state === "done") {
          // Fabric is done; kick off the subtitles pass and store both URLs.
          // `preset` is required by veed/subtitles and comes from org config;
          // `language` is optional but recommended for accuracy. Both fall back
          // to module defaults if a legacy DB row has an unrecognised value.
          const config = await getOrgConfig();
          const preset = isSubtitlePreset(config.subtitlePreset)
            ? config.subtitlePreset
            : DEFAULT_SUBTITLE_PRESET;
          const language = isSubtitleLanguage(config.subtitleLanguage)
            ? config.subtitleLanguage
            : DEFAULT_SUBTITLE_LANGUAGE;
          const subtitleRequestId = await submitSubtitles({
            videoUrl: st.videoUrl,
            preset,
            language,
          });
          return setStatus(id, "GENERATING_SUBTITLES", {
            videoUrl: st.videoUrl,
            subtitleRequestId,
          });
        }
        if (st.state === "error") throw new Error(st.message);
        return item; // still cooking
      }
      case "GENERATING_SUBTITLES": {
        if (!item.subtitleRequestId)
          throw new Error("Missing subtitle request id");
        const st = await checkSubtitles(item.subtitleRequestId);
        if (st.state === "done")
          return setStatus(id, "READY", { subtitledVideoUrl: st.videoUrl });
        if (st.state === "error") throw new Error(st.message);
        return item; // still cooking
      }
      case "READY":
      case "FAILED":
        return item;
    }
  } catch (err) {
    return fail(id, err);
  }
}

/** Create a media item for an article and run the first step. */
export async function startGeneration(opts: {
  articleId: string;
  presenterId?: string;
  voiceId?: string;
}) {
  const config = await getOrgConfig();
  const presenterId = opts.presenterId ?? config.defaultPresenterId;
  if (!presenterId)
    throw new Error(
      "No presenter selected and no default presenter configured",
    );
  await db.presenter.findUniqueOrThrow({ where: { id: presenterId } });

  const created = await db.mediaItem.create({
    data: {
      articleId: opts.articleId,
      presenterId,
      voiceId: resolveVoiceFor(
        config.ttsModel,
        opts.voiceId ?? config.defaultVoiceId,
      ),
    },
  });
  return advance(created.id);
}

/**
 * Re-run TTS + video with an edited script (keeps caption unless provided).
 * Presenter and voice can be swapped at the same time. The voice is resolved
 * against the org's current TTS model: a voice from another provider (e.g. a
 * legacy id on an old item) falls back to that provider's default.
 */
export async function regenerateVideo(
  id: string,
  opts: {
    script: string;
    caption?: string;
    presenterId?: string;
    voiceId?: string;
  },
) {
  const [item, config] = await Promise.all([
    db.mediaItem.findUniqueOrThrow({ where: { id } }),
    getOrgConfig(),
  ]);
  const voiceId = resolveVoiceFor(
    config.ttsModel,
    opts.voiceId ?? item.voiceId,
  );
  await db.mediaItem.update({
    where: { id },
    data: {
      status: "GENERATING_AUDIO",
      script: opts.script,
      caption: opts.caption,
      presenterId: opts.presenterId,
      voiceId,
      audioUrl: null,
      videoUrl: null,
      subtitledVideoUrl: null,
      falRequestId: null,
      subtitleRequestId: null,
      error: null,
    },
  });
  return advance(id);
}

/** Retry a failed item from the step it failed at. */
export async function retry(id: string) {
  const item = await getMediaItem(id);
  if (item.status !== "FAILED") return item;
  // If we already finished Fabric but the subtitle pass failed, resume there
  // so we don't re-render the talking-head video unnecessarily.
  if (item.videoUrl && !item.subtitledVideoUrl)
    return resumeFrom(id, "GENERATING_SUBTITLES");
  const next: MediaStatus = !item.script
    ? "QUEUED"
    : !item.audioUrl
      ? "GENERATING_AUDIO"
      : !item.falRequestId
        ? "GENERATING_AUDIO"
        : "GENERATING_VIDEO";
  await db.mediaItem.update({
    where: { id },
    data: { status: next, error: null },
  });
  return advance(id);
}

/** Drop the item into the given state (clearing any error) and advance it. */
async function resumeFrom(id: string, status: MediaStatus) {
  await db.mediaItem.update({
    where: { id },
    data: { status, error: null },
  });
  return advance(id);
}
