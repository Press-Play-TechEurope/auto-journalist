import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  advance,
  getMediaItem,
  regenerateVideo,
  retry,
  startGeneration,
} from "~/server/pipeline";

export const mediaRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        article: { include: { source: { select: { id: true, name: true } } } },
        presenter: true,
        publications: true,
      },
    }),
  ),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getMediaItem(input.id)),

  start: publicProcedure
    .input(
      z.object({
        articleId: z.string(),
        presenterId: z.string().optional(),
        voiceId: z.string().optional(),
      }),
    )
    .mutation(({ input }) => startGeneration(input)),

  /** Run one pipeline step; client polls this until status is READY/FAILED. */
  advance: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => advance(input.id)),

  regenerate: publicProcedure
    .input(
      z.object({
        id: z.string(),
        script: z.string().trim().min(10),
        caption: z.string().optional(),
        presenterId: z.string().optional(),
        voiceId: z.string().optional(),
      }),
    )
    .mutation(({ input }) =>
      regenerateVideo(input.id, {
        script: input.script,
        caption: input.caption,
        presenterId: input.presenterId,
        voiceId: input.voiceId,
      }),
    ),

  retry: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => retry(input.id)),

  updateCopy: publicProcedure
    .input(
      z.object({
        id: z.string(),
        script: z.string().optional(),
        caption: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.mediaItem.update({
        where: { id: input.id },
        data: { script: input.script, caption: input.caption },
      }),
    ),

  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.mediaItem.delete({ where: { id: input.id } }),
    ),
});
