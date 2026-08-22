import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const presenterRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.presenter.findMany({ orderBy: { sortOrder: "asc" } }),
  ),
});
