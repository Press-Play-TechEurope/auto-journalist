import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { env } from "~/env";

export const OPENAI_MODEL = "gpt-5.6-terra";

const ScriptOutput = z.object({
  headline: z
    .string()
    .describe("Short punchy headline for the video (max 80 chars)."),
  script: z
    .string()
    .describe(
      "The full spoken script, plain prose only. No stage directions, speaker labels, markdown, or bracketed notes.",
    ),
  caption: z
    .string()
    .describe(
      "Social media caption for the post: 1–2 sentences plus 3–5 relevant hashtags.",
    ),
});
export type ScriptOutput = z.infer<typeof ScriptOutput>;

export type ScriptInput = {
  brandName: string;
  tone: string;
  targetSeconds: number;
  presenterName: string;
  article: {
    title: string;
    url: string;
    sourceName: string;
    publishedAt: Date;
    summary?: string | null;
    content: string;
  };
};

/** Generate a spoken news script + social caption from an article. */
export async function generateScript(
  input: ScriptInput,
): Promise<ScriptOutput> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const targetWords = Math.round(input.targetSeconds * 2.4); // ~145 wpm

  const system = [
    `You are the head writer for "${input.brandName}", a short-form video news brand.`,
    `You write scripts that a single on-camera presenter (${input.presenterName}) reads aloud to camera.`,
    `Tone & style guidance: ${input.tone}`,
    ``,
    `Rules:`,
    `- Target length: about ${targetWords} words (~${input.targetSeconds} seconds spoken). Stay within ±15%.`,
    `- The script MUST open with the exact greeting: "Hi, I'm ${input.presenterName} from ${input.brandName}." Then immediately follow with a hook sentence; close with a one-line takeaway.`,
    `- Attribute the story to the source by name once (e.g. "according to ${input.article.sourceName}").`,
    `- Only use facts present in the article. Do not invent quotes, numbers, or names.`,
    `- Write for the ear: short sentences, contractions, no lists, no URLs, numbers spelled naturally.`,
    `- Output plain prose only — no headings, no speaker labels, no stage directions, no emojis.`,
  ].join("\n");

  const user = [
    `SOURCE: ${input.article.sourceName}`,
    `TITLE: ${input.article.title}`,
    `PUBLISHED: ${input.article.publishedAt.toISOString()}`,
    `URL: ${input.article.url}`,
    input.article.summary ? `SUMMARY: ${input.article.summary}` : "",
    ``,
    `ARTICLE CONTENT:`,
    input.article.content.slice(0, 24_000),
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.responses.parse({
    model: OPENAI_MODEL,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: { format: zodTextFormat(ScriptOutput, "video_script") },
  });

  const parsed = response.output_parsed;
  if (!parsed) throw new Error("OpenAI returned no structured output");
  return parsed;
}
