import Parser from "rss-parser";

import { db } from "~/server/db";

type CustomItem = {
  "media:content"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  "media:thumbnail"?:
    { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  enclosure?: { url?: string; type?: string };
  "content:encoded"?: string;
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 15_000,
  headers: {
    "User-Agent": "auto-journalist/0.1 (+https://auto-journalist.vercel.app)",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["media:thumbnail", "media:thumbnail", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
});

function firstUrl(v: CustomItem["media:content"]): string | undefined {
  if (!v) return undefined;
  const node = Array.isArray(v) ? v[0] : v;
  return node?.$?.url;
}

function pickImage(item: Parser.Item & CustomItem): string | undefined {
  return (
    firstUrl(item["media:content"]) ??
    firstUrl(item["media:thumbnail"]) ??
    (item.enclosure?.type?.startsWith("image/")
      ? item.enclosure.url
      : undefined) ??
    /<img[^>]+src=["']([^"']+)["']/i.exec(
      item["content:encoded"] ?? item.content ?? "",
    )?.[1]
  );
}

function stripHtml(s: string | undefined) {
  return s
    ?.replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Fetch one feed and upsert its items. Returns count of new articles. */
export async function pollSource(sourceId: string): Promise<number> {
  const source = await db.source.findUniqueOrThrow({ where: { id: sourceId } });
  try {
    const feed = await parser.parseURL(source.feedUrl);
    let created = 0;
    for (const item of feed.items) {
      const link = item.link?.trim();
      if (!link || !item.title) continue;
      const guid = item.guid ?? link;
      const publishedAt = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : new Date();
      const data = {
        title: item.title.trim(),
        url: link,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        summary: stripHtml(
          item.contentSnippet ?? item.summary ?? item.content,
        )?.slice(0, 1000),
        imageUrl: pickImage(item),
      };
      const res = await db.article.upsert({
        where: { sourceId_guid: { sourceId, guid } },
        create: { sourceId, guid, ...data },
        update: {
          title: data.title,
          summary: data.summary,
          imageUrl: data.imageUrl ?? undefined,
        },
        select: { createdAt: true },
      });
      if (Date.now() - res.createdAt.getTime() < 5_000) created++;
    }
    await db.source.update({
      where: { id: sourceId },
      data: {
        lastPolledAt: new Date(),
        lastError: null,
        siteUrl: source.siteUrl ?? feed.link ?? null,
      },
    });
    return created;
  } catch (err) {
    await db.source.update({
      where: { id: sourceId },
      data: {
        lastPolledAt: new Date(),
        lastError: err instanceof Error ? err.message : String(err),
      },
    });
    return 0;
  }
}

/** Poll every source, or only those not polled within `staleMinutes`. */
export async function pollAllSources(opts: { staleMinutes?: number } = {}) {
  const cutoff = opts.staleMinutes
    ? new Date(Date.now() - opts.staleMinutes * 60_000)
    : undefined;
  const sources = await db.source.findMany({
    where: cutoff
      ? { OR: [{ lastPolledAt: null }, { lastPolledAt: { lt: cutoff } }] }
      : undefined,
    select: { id: true },
  });
  const results = await Promise.allSettled(
    sources.map((s) => pollSource(s.id)),
  );
  const created = results.reduce(
    (n, r) => n + (r.status === "fulfilled" ? r.value : 0),
    0,
  );
  return { polled: sources.length, created };
}

/** Validate a feed URL and return its title (used when adding a source). */
export async function probeFeed(feedUrl: string) {
  const feed = await parser.parseURL(feedUrl);
  return {
    title: feed.title ?? new URL(feedUrl).hostname,
    siteUrl: feed.link ?? null,
  };
}
