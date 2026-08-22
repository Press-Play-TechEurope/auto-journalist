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

/** Run `fn` over `items` with at most `limit` in flight at once. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]!) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

/** Fetch one feed and upsert its items. Returns count of new articles. */
export async function pollSource(sourceId: string): Promise<number> {
  const source = await db.source.findUniqueOrThrow({ where: { id: sourceId } });
  try {
    const feed = await parser.parseURL(source.feedUrl);

    // Normalise feed items, de-duping by guid within the feed (first wins).
    const items = new Map<
      string,
      {
        title: string;
        url: string;
        publishedAt: Date;
        summary: string | undefined;
        imageUrl: string | undefined;
      }
    >();
    for (const item of feed.items) {
      const link = item.link?.trim();
      if (!link || !item.title) continue;
      const guid = item.guid ?? link;
      if (items.has(guid)) continue;
      const publishedAt = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : new Date();
      items.set(guid, {
        title: item.title.trim(),
        url: link,
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        summary: stripHtml(
          item.contentSnippet ?? item.summary ?? item.content,
        )?.slice(0, 1000),
        imageUrl: pickImage(item),
      });
    }

    // One round-trip to learn what we already have, instead of one upsert per item.
    const existing = new Map(
      (
        await db.article.findMany({
          where: { sourceId, guid: { in: [...items.keys()] } },
          select: { guid: true, title: true, summary: true, imageUrl: true },
        })
      ).map((a) => [a.guid, a] as const),
    );

    const toCreate = [...items]
      .filter(([guid]) => !existing.has(guid))
      .map(([guid, data]) => ({ sourceId, guid, ...data }));
    const toUpdate = [...items].flatMap(([guid, data]) => {
      const cur = existing.get(guid);
      if (!cur) return [];
      const changed =
        cur.title !== data.title ||
        (data.summary ?? null) !== cur.summary ||
        (data.imageUrl !== undefined && data.imageUrl !== cur.imageUrl);
      return changed ? [{ guid, data }] : [];
    });

    const [createdRes] = await Promise.all([
      toCreate.length
        ? db.article.createMany({ data: toCreate, skipDuplicates: true })
        : Promise.resolve({ count: 0 }),
      mapWithConcurrency(toUpdate, 5, ({ guid, data }) =>
        db.article.update({
          where: { sourceId_guid: { sourceId, guid } },
          data: {
            title: data.title,
            summary: data.summary,
            imageUrl: data.imageUrl ?? undefined,
          },
        }),
      ),
    ]);

    await db.source.update({
      where: { id: sourceId },
      data: {
        lastPolledAt: new Date(),
        lastError: null,
        siteUrl: source.siteUrl ?? feed.link ?? null,
      },
    });
    return createdRes.count;
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

/** How many feeds to poll at once. Keeps us under Prisma's connection pool. */
const POLL_CONCURRENCY = 8;

/** Poll every source, or only those not polled within `staleMinutes`. */
export async function pollAllSources(opts: { staleMinutes?: number } = {}) {
  const cutoff = opts.staleMinutes
    ? new Date(Date.now() - opts.staleMinutes * 60_000)
    : undefined;
  const sources = await db.source.findMany({
    where: cutoff
      ? { OR: [{ lastPolledAt: null }, { lastPolledAt: { lt: cutoff } }] }
      : undefined,
    // Stalest first, so if a run is cut short (e.g. serverless timeout) the
    // sources that missed out lead the next run instead of being starved.
    orderBy: { lastPolledAt: { sort: "asc", nulls: "first" } },
    select: { id: true },
  });
  const results = await mapWithConcurrency(sources, POLL_CONCURRENCY, (s) =>
    pollSource(s.id),
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
