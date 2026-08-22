import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getOrgConfig } from "~/server/pipeline";

export const configRouter = createTRPCRouter({
  get: publicProcedure.query(() => getOrgConfig()),

  update: publicProcedure
    .input(
      z.object({
        brandName: z.string().trim().min(1).max(80),
        tone: z.string().trim().min(1).max(2000),
        targetSeconds: z.number().int().min(15).max(180),
        defaultPresenterId: z.string().nullable(),
        ttsModel: z.string().trim().min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.orgConfig.upsert({
        where: { id: "default" },
        create: { id: "default", ...input },
        update: input,
        include: { defaultPresenter: true },
      }),
    ),
});
