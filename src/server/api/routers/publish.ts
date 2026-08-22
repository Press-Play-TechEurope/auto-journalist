import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { publishers } from "~/server/lib/publish";

export const publishRouter = createTRPCRouter({
  post: publicProcedure
    .input(
      z.object({
        mediaItemId: z.string(),
        platform: z.enum(["X", "INSTAGRAM"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.mediaItem.findUniqueOrThrow({
        where: { id: input.mediaItemId },
      });
      if (item.status !== "READY" || !item.videoUrl) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Video is not ready yet.",
        });
      }
      const result = await publishers[input.platform].publish({
        mediaItemId: item.id,
        videoUrl: item.videoUrl,
        caption: item.caption ?? "",
      });
      return ctx.db.publication.upsert({
        where: {
          mediaItemId_platform: {
            mediaItemId: item.id,
            platform: input.platform,
          },
        },
        create: {
          mediaItemId: item.id,
          platform: input.platform,
          externalUrl: result.externalUrl,
        },
        update: { externalUrl: result.externalUrl, postedAt: new Date() },
      });
    }),
});
