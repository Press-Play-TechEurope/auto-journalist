import { z } from "zod";

import { Prisma, type PrismaClient } from "../../../../generated/prisma";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { enrichArticle } from "~/server/pipeline";

/**
 * Ranked full-text search over Article.searchVector (see
 * prisma/manual/2026-08-22-article-fulltext-search.sql). Returns ids in
 * relevance order plus a snippet from the summary/body with matches wrapped
 * in \x01…\x02 (control chars, not HTML, so the client can render it safely —
 * see <Snippet> in feed.tsx).
 */
async function searchArticles(
  db: PrismaClient,
  input: {
    q: string;
    sourceId?: string;
    folderId?: string;
    offset: number;
    limit: number;
  },
) {
  const where: Prisma.Sql[] = [Prisma.sql`a."searchVector" @@ query`];
  if (input.sourceId) where.push(Prisma.sql`a."sourceId" = ${input.sourceId}`);
  if (input.folderId === "starred")
    where.push(Prisma.sql`a."starredAt" IS NOT NULL`);
  else if (input.folderId === "unfiled")
    where.push(Prisma.sql`s."folderId" IS NULL`);
  else if (input.folderId)
    where.push(Prisma.sql`s."folderId" = ${input.folderId}`);

  return db.$queryRaw<{ id: string; snippet: string | null }[]>`
    SELECT
      a."id",
      NULLIF(
        ts_headline(
          'english',
          left(coalesce(a."summary", a."extract" ->> 'content', a."rawContent", ''), 20000),
          query,
          'MaxWords=30, MinWords=12, MaxFragments=1, StartSel=' || chr(1) || ', StopSel=' || chr(2)
        ),
        ''
      ) AS "snippet"
    FROM "Article" a
    JOIN "Source" s ON s."id" = a."sourceId",
    websearch_to_tsquery('english', ${input.q}) query
    WHERE ${Prisma.join(where, " AND ")}
    ORDER BY ts_rank_cd(a."searchVector", query) DESC, a."publishedAt" DESC, a."id" DESC
    LIMIT ${input.limit} OFFSET ${input.offset}
  `;
}

export const articleRouter = createTRPCRouter({
  feed: publicProcedure
    .input(
      z
        .object({
          sourceId: z.string().optional(),
          /**
           * Filter to sources in this folder. "unfiled" = sources with no
           * folder; "starred" = starred articles across every folder.
           */
          folderId: z.string().optional(),
          /**
           * Full-text query over title, summary and body (Postgres
           * websearch syntax: quoted phrases, -exclusions, OR). When set,
           * results are ranked by relevance and the cursor is an offset.
           */
          q: z.string().trim().optional(),
          cursor: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(40),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const include = {
        source: { select: { id: true, name: true, siteUrl: true } },
        mediaItems: {
          select: { id: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      } satisfies Prisma.ArticleInclude;

      if (input.q) {
        const offset = input.cursor ? Number.parseInt(input.cursor, 10) : 0;
        const ranked = await searchArticles(ctx.db, {
          ...input,
          q: input.q,
          offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
          limit: input.limit + 1,
        });
        const nextCursor =
          ranked.length > input.limit
            ? String(offset + input.limit)
            : undefined;
        const page = ranked.slice(0, input.limit);
        const rows = await ctx.db.article.findMany({
          where: { id: { in: page.map((r) => r.id) } },
          include,
        });
        const byId = new Map(rows.map((r) => [r.id, r]));
        const items = page.flatMap((r) => {
          const row = byId.get(r.id);
          return row ? [{ ...row, snippet: r.snippet }] : [];
        });
        return { items, nextCursor };
      }

      const rows = await ctx.db.article.findMany({
        where: {
          sourceId: input.sourceId,
          ...(input.folderId === "starred"
            ? { starredAt: { not: null } }
            : input.folderId
              ? {
                  source: {
                    folderId:
                      input.folderId === "unfiled" ? null : input.folderId,
                  },
                }
              : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include,
      });
      let nextCursor: string | undefined;
      if (rows.length > input.limit) nextCursor = rows.pop()!.id;
      const items = rows.map((row) => ({ ...row, snippet: null }));
      return { items, nextCursor };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.article.findUniqueOrThrow({
        where: { id: input.id },
        include: {
          source: true,
          mediaItems: {
            orderBy: { createdAt: "desc" },
            include: { presenter: true },
          },
        },
      }),
    ),

  enrich: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => enrichArticle(input.id)),

  /** Number of starred articles — drives the "Starred" tab in the feed. */
  starredCount: publicProcedure.query(({ ctx }) =>
    ctx.db.article.count({ where: { starredAt: { not: null } } }),
  ),

  /** Star or unstar an article. Starring never triggers media generation. */
  setStarred: publicProcedure
    .input(z.object({ id: z.string(), starred: z.boolean() }))
    .mutation(({ ctx, input }) =>
      ctx.db.article.update({
        where: { id: input.id },
        data: { starredAt: input.starred ? new Date() : null },
        select: { id: true, starredAt: true },
      }),
    ),
});
