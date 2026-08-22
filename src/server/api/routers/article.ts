import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { enrichArticle } from "~/server/pipeline";

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
          q: z.string().trim().optional(),
          cursor: z.string().optional(),
          limit: z.number().int().min(1).max(100).default(40),
        })
        .default({}),
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.article.findMany({
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
          ...(input.q
            ? { title: { contains: input.q, mode: "insensitive" } }
            : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          source: { select: { id: true, name: true, siteUrl: true } },
          mediaItems: {
            select: { id: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
      let nextCursor: string | undefined;
      if (items.length > input.limit) nextCursor = items.pop()!.id;
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
