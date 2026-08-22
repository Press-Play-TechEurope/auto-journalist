import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const name = z.string().trim().min(1).max(60);

export const folderRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.folder.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { sources: true } } },
    }),
  ),

  create: publicProcedure
    .input(z.object({ name }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.folder.findUnique({
        where: { name: input.name },
      });
      if (existing)
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with that name already exists.",
        });
      const last = await ctx.db.folder.findFirst({
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      return ctx.db.folder.create({
        data: { name: input.name, sortOrder: (last?.sortOrder ?? -1) + 1 },
      });
    }),

  rename: publicProcedure
    .input(z.object({ id: z.string(), name }))
    .mutation(async ({ ctx, input }) => {
      const clash = await ctx.db.folder.findUnique({
        where: { name: input.name },
      });
      if (clash && clash.id !== input.id)
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with that name already exists.",
        });
      return ctx.db.folder.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  /** Deletes the folder; its sources become unfiled (folderId → null). */
  remove: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.folder.delete({ where: { id: input.id } }),
    ),
});
