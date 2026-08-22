import { tavily } from "@tavily/core";

import { env } from "~/env";

export type TavilyExtract = {
  title: string | null;
  content: string;
  images: string[];
  favicon?: string;
};

/** Run Tavily Extract on a URL. Throws if the key is missing or extraction fails. */
export async function extractArticle(url: string): Promise<TavilyExtract> {
  if (!env.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not set");
  const client = tavily({ apiKey: env.TAVILY_API_KEY });
  const res = await client.extract([url], {
    includeImages: true,
    extractDepth: "basic",
    format: "markdown",
  });
  const hit = res.results[0];
  if (!hit) {
    const failed = res.failedResults?.[0];
    throw new Error(
      `Tavily could not extract ${url}${failed ? `: ${failed.error}` : ""}`,
    );
  }
  return {
    title: hit.title ?? null,
    content: hit.rawContent,
    images: (hit.images ?? []).slice(0, 8),
    favicon: hit.favicon,
  };
}
