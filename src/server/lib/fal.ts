import { readFile } from "node:fs/promises";
import path from "node:path";

import { fal } from "@fal-ai/client";

import { env } from "~/env";

export const FABRIC_MODEL = "veed/fabric-1.0";
export const SUBTITLES_MODEL = "veed/subtitles";

let configured = false;
function client() {
  if (!env.FAL_KEY) throw new Error("FAL_KEY is not set");
  if (!configured) {
    fal.config({ credentials: env.FAL_KEY });
    configured = true;
  }
  return fal;
}

/** Keep generated files on fal's CDN indefinitely (we serve from there). */
const KEEP_FOREVER = { expiresIn: "never" as const };

type TtsResult = { audio: { url: string }; duration_ms?: number };

/** Text → speech via a fal TTS endpoint. Synchronous (a few seconds). */
export async function synthesizeSpeech(opts: {
  model: string;
  text: string;
  voiceId: string;
}): Promise<{ audioUrl: string; durationMs?: number }> {
  const input: Record<string, unknown> = { text: opts.text.slice(0, 5000) };
  if (opts.model.startsWith("fal-ai/elevenlabs/")) {
    // `voice` is an ElevenLabs voice name or voice_id.
    input.voice = opts.voiceId;
    input.stability = 0.5;
    input.apply_text_normalization = "on";
    if (!opts.model.endsWith("/eleven-v3")) {
      // eleven-v3 only exposes `stability`.
      input.similarity_boost = 0.75;
      input.speed = 1;
    }
  } else if (opts.model.startsWith("fal-ai/minimax/")) {
    input.voice_setting = {
      voice_id: opts.voiceId,
      speed: 1,
      vol: 1,
      pitch: 0,
      english_normalization: true,
    };
    input.output_format = "url";
  } else {
    // Generic fallback for other fal TTS endpoints that accept a `voice` string.
    input.voice = opts.voiceId;
  }
  const res = await client().subscribe(opts.model, {
    input,
    storageSettings: KEEP_FOREVER,
  });
  const data = res.data as TtsResult;
  if (!data?.audio?.url) throw new Error("TTS returned no audio url");
  return { audioUrl: data.audio.url, durationMs: data.duration_ms };
}

/**
 * fal needs a publicly fetchable image URL. Presenter images that live in
 * `public/` are stored as root-relative paths (e.g. `/presenters/zach.jpg`),
 * which fal can't reach from localhost — upload those to fal storage first.
 * Absolute URLs pass through untouched.
 */
const uploadedImages = new Map<string, string>();
async function resolveImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("/")) return imageUrl;
  const cached = uploadedImages.get(imageUrl);
  if (cached) return cached;
  const file = path.join(process.cwd(), "public", imageUrl);
  const bytes = await readFile(file);
  const ext = path.extname(file).slice(1).toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const url = await client().storage.upload(
    new File([bytes], path.basename(file), { type }),
  );
  uploadedImages.set(imageUrl, url);
  return url;
}

/** Submit a Fabric talking-head job. Returns the queue request id. */
export async function submitTalkingHead(opts: {
  imageUrl: string;
  audioUrl: string;
  resolution?: "480p" | "720p";
}): Promise<string> {
  const { request_id } = await client().queue.submit(FABRIC_MODEL, {
    input: {
      image_url: await resolveImageUrl(opts.imageUrl),
      audio_url: opts.audioUrl,
      resolution: opts.resolution ?? "480p",
    },
    storageSettings: KEEP_FOREVER,
  });
  return request_id;
}

export type TalkingHeadStatus =
  | { state: "queued"; position?: number }
  | { state: "running" }
  | { state: "done"; videoUrl: string }
  | { state: "error"; message: string };

/** Check a Fabric job; fetches the result when complete. */
export async function checkTalkingHead(
  requestId: string,
): Promise<TalkingHeadStatus> {
  const f = client();
  try {
    const status = await f.queue.status(FABRIC_MODEL, {
      requestId,
      logs: false,
    });
    if (status.status === "IN_QUEUE")
      return { state: "queued", position: status.queue_position };
    if (status.status === "IN_PROGRESS") return { state: "running" };
    const result = await f.queue.result(FABRIC_MODEL, { requestId });
    const data = result.data as { video?: { url?: string } };
    if (!data?.video?.url)
      return { state: "error", message: "Fabric returned no video url" };
    return { state: "done", videoUrl: data.video.url };
  } catch (err) {
    return {
      state: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Submit a veed/subtitles job. The model auto-transcribes the video's audio and
 * burns the captions in using the chosen `preset` (required). `language` is
 * optional but recommended — it improves transcription accuracy when it matches
 * the source audio. Basic presets cost 1x, dynamic presets cost 2x — see
 * https://fal.ai/models/veed/subtitles.
 */
export async function submitSubtitles(opts: {
  videoUrl: string;
  preset: string;
  language?: string;
}): Promise<string> {
  const { request_id } = await client().queue.submit(SUBTITLES_MODEL, {
    input: {
      video_url: opts.videoUrl,
      preset: opts.preset,
      language: opts.language,
    },
    storageSettings: KEEP_FOREVER,
  });
  return request_id;
}

export type SubtitlesStatus =
  | { state: "queued"; position?: number }
  | { state: "running" }
  | { state: "done"; videoUrl: string }
  | { state: "error"; message: string };

/** Check a veed/subtitles job; fetches the result when complete. */
export async function checkSubtitles(
  requestId: string,
): Promise<SubtitlesStatus> {
  const f = client();
  try {
    const status = await f.queue.status(SUBTITLES_MODEL, {
      requestId,
      logs: false,
    });
    if (status.status === "IN_QUEUE")
      return { state: "queued", position: status.queue_position };
    if (status.status === "IN_PROGRESS") return { state: "running" };
    const result = await f.queue.result(SUBTITLES_MODEL, { requestId });
    const data = result.data as { video?: { url?: string } };
    if (!data?.video?.url)
      return {
        state: "error",
        message: "veed/subtitles returned no video url",
      };
    return { state: "done", videoUrl: data.video.url };
  } catch (err) {
    return {
      state: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}
