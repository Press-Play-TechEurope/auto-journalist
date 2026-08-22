import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { VOICES } from "~/server/voices";

export const presenterRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.presenter.findMany({ orderBy: { sortOrder: "asc" } }),
  ),
  voices: publicProcedure.query(() => VOICES),
});
