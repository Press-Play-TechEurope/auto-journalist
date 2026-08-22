import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { pollAllSources, pollSource, probeFeed } from "~/server/lib/rss";

export const sourceRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.source.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
  ),

  add: publicProcedure
    .input(
      z.object({
        feedUrl: z.string().url(),
        name: z.string().trim().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.source.findUnique({
        where: { feedUrl: input.feedUrl },
      });
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "That feed is already added.",
        });
      let probe: { title: string; siteUrl: string | null };
      try {
        probe = await probeFeed(input.feedUrl);
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Could not read that feed: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      const source = await ctx.db.source.create({
        data: {
          feedUrl: input.feedUrl,
          name: input.name ?? probe.title,
          siteUrl: probe.siteUrl,
        },
      });
      await pollSource(source.id);
      return source;
    }),

  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.source.delete({ where: { id: input.id } }),
    ),

  refresh: publicProcedure
    .input(
      z
        .object({
          id: z.string().optional(),
          staleMinutes: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      if (input?.id) return { polled: 1, created: await pollSource(input.id) };
      return pollAllSources({ staleMinutes: input?.staleMinutes });
    }),
});
